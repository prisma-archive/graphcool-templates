'use latest'

const { request, GraphQLClient }  = require('graphql-request')

// Set up connection to the API endpoint
const PAT = '__PAT__'
const projectId = '__PROJECTID__'
const endPointUrl = `https://api.graph.cool/simple/v1/${projectId}`
const client = new GraphQLClient(endPointUrl, {
  headers: {
    Authorization: `Bearer ${PAT}`,
  },
})

module.exports = function (event) {
  const nextMove = takeNoobMove(event.data.GameState.node.board)
  const mutation = `mutation {
	createMove(
		gameId: "${event.data.GameState.node.game.id}",
		position: ${nextMove+1},
		player: Computer)
	{ id } }`

  // Return a Promise to wait for the mutation to complete
  return new Promise((resolve,reject) => {
	client.request(mutation)
  	  .then(data => resolve({ data: event.data }))
      .catch(err => resolve({ error: err}))
  })
}

function findEmptySpots(board)
{
  const emptySpots = []
  for (var i = 0; i < board.length; i++)
  {
    if (board[i] === "") emptySpots.push(i)
  }
  return emptySpots
}

function takeNoobMove(board) {
  const available = findEmptySpots(board);
  var randomCell = available[Math.floor(Math.random() * available.length)];
  return randomCell
}
