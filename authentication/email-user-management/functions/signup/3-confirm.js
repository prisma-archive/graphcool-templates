const fromEvent = require("graphcool-lib").fromEvent

module.exports = function (event) {
	const confirmToken = event.data.confirmToken
	const graphcool = fromEvent(event)
	const api = graphcool.api("simple/v1")

	function getUserWithToken(confirmToken) {
		return api.request(`
			query {
				User(confirmToken: "${confirmToken}") {
					id
				}
			}`)
			.then(userQueryResult => {
				if (userQueryResult.error) {
					return Promise.reject(userQueryResult.error)
				} else if (!userQueryResult.User) {
					return Promise.reject("Not a valid token")
				}
				return userQueryResult.User.id
			})
	}

	function confirmUser(userId) {
		return api.request(`
			mutation {
				updateUser(
					id: "${userId}",
					confirmed: true,
					confirmToken: null,
					confirmExpires: null
				) {
					id
				}
			}`)
			.then(userMutationResult => (userMutationResult.updateUser.id))
	}

	return getUserWithToken(confirmToken)
		.then(graphcoolUser => {
			console.log(graphcoolUser)
			const userId = graphcoolUser
			if (graphcoolUser === null) {
				return Promise.reject("No such token.")
			} else if (new Date() > new Date(graphcoolUser.confirmExpires)) {
				return Promise.reject("Token expired.")
			}
			return confirmUser(userId)
				.then(id => ({ data: { id } }))
				.catch(error => ({ error: error.toString() }))
		})
		.catch(error => {
			return { error: error }
		})
}
