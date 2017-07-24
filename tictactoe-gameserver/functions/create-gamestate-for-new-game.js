'use latest'

const { fromEvent } = require('graphcool-lib')
const crypto = require('crypto')

const pat = '__PAT__'
const projectId = '__PROJECTID__'

module.exports = (event) => {
  event.context = { graphcool: { pat, projectId } }
  const api = fromEvent(event).api('simple/v1');

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
	api.request(mutation)
  	  .then(data => resolve({ data: event.data }))
      .catch(err => resolve({ error: err}))
  })
}
