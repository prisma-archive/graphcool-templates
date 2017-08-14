const fromEvent = require("graphcool-lib").fromEvent
const crypto = require("crypto")

module.exports = function (event) {
	const email = event.data.email

	const graphcool = fromEvent(event)
	const api = graphcool.api("simple/v1")

	function getGraphcoolUser(email) {
		return api.request(`
			query {
				User(email: "${email}") {
					id
				}
			}`)
			.then(userQueryResult => {
				if (userQueryResult.error) {
					return Promise.reject(userQueryResult.error)
				}
				return userQueryResult.User
			})
	}

	function generateToken() {
		return crypto.randomBytes(20).toString("hex")
	}

	function generateExpiration() {
		const now = new Date()
		return new Date(now.getTime() + 3600000).toISOString()
	}

	function updateGraphcoolUser(userId) {
		return api.request(`
			mutation {
				updateUser(
					id: "${userId}",
					confirmToken: "${generateToken()}",
					confirmExpires: "${generateExpiration()}"
				) {
					id
				}
			}`)
			.then(userMutationResult => {
				return userMutationResult.updateUser.id
			})
	}

	return getGraphcoolUser(email)
		.then(graphcoolUser => {
			return updateGraphcoolUser(graphcoolUser.id)
		})
		.then(id => {
			return { data: { id } }
		})
		.catch(error => {
			return { error: error.toString() }
		})
}
