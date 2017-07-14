const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = function(event) {
  const email = event.data.email
  const password = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGraphcoolUser(email) {
    return api.request(`
    query {
      User(email: "${email}"){
        id
        password
      }
    }`)
      .then((userQueryResult) => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else {
          return userQueryResult.User
        }
      })
  }

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
  }

  if (validator.isEmail(email)) {
    return getGraphcoolUser(email)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return Promise.reject("Invalid Credentials") //returning same generic error so user cant find out what emails are registered.
        } else {
          return bcrypt.compare(password, graphcoolUser.password)
            .then((res) => {
              if (res == true) {
                return graphcoolUser.id
              } else {
                return Promise.reject("Invalid Credentials")
              }
            })
        }
      })
      .then(generateGraphcoolToken)
      .then((token) => {
        return { data: { token: token } }
      })
      .catch((error) => {
        return { error: error.toString() }
      })
  } else {
    return { error: "Not a valid email" }
  }  
}