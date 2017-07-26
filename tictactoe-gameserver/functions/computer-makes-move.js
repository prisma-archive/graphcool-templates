'use latest'

const { fromEvent } = require('graphcool-lib')

const pat = '__PAT__'
const projectId = '__PROJECTID__'

module.exports = (event) => {
  event.context = { graphcool: { pat, projectId } }
  const api = fromEvent(event).api('simple/v1');

  const nextMove = takeNoobMove(event.data.GameState.node.board)
  const mutation = `mutation {
	createMove(
		gameId: "${event.data.GameState.node.game.id}",
		position: ${nextMove+1},
		player: Computer)
	{ id } }`

  // Return a Promise to wait for the mutation to complete
  return new Promise((resolve,reject) => {
	api.request(mutation)
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
