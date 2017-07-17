'use latest'

const { request, GraphQLClient }  = require('graphql-request')
const crypto = require('crypto')

// Set up connection to the API endpoint
const PAT = '__PAT__'
const projectId = '__PROJECTID__'
const endPointUrl = `https://api.graph.cool/simple/v1/${projectId}`
const client = new GraphQLClient(endPointUrl, {
  headers: {
    Authorization: `Bearer ${PAT}`,
  },
})

module.exports = (event) => {
  // Flip a coin to see who gets to go first
  const turn = crypto.randomBytes(1)[0] > 127 ? "User" : "Computer"

  // Flip another coin to determine player symbol
  const playerSymbol = crypto.randomBytes(1)[0] > 127 ? "X" : "O"


  // Mutation to create GameState for the new Game
  const mutation = `mutation {
	createGameState(
		gameId: "${event.data.id}",
		turn: ${turn},
		playerSymbol: ${playerSymbol})
	{ id } }`

  // Return a Promise to wait for the mutation to complete
  return new Promise((resolve,reject) => {
	client.request(mutation)
  	  .then(data => resolve({ data: event.data }))
      .catch(err => resolve({ error: err}))
  })
}
