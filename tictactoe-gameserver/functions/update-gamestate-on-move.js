'use latest'

const { fromEvent } = require('graphcool-lib')

const pat = '__PAT__'
const projectId = '__PROJECTID__'

module.exports = (event) => {
  event.context = { graphcool: { pat, projectId } }
  const api = fromEvent(event).api('simple/v1');

  // Query to get GameState
  const gameStateQuery = `query {
	Game(id: "${event.data.gameId}") { gameState { id playerSymbol board turn } } }`

  // Return a Promise to wait for the mutation to complete
  return new Promise((resolve,reject) => {
	api.request(gameStateQuery)
  	  .then(data => {
      	const { id, playerSymbol, board } = data.Game.gameState

        // Determine which symbol to play with
        const symbol = (event.data.player != "Computer") ? playerSymbol : (playerSymbol == "X" ? "O" : "X")

        // Update board and turn
        board[event.data.position-1] = symbol
      	let turn = data.Game.gameState.turn == "Computer" ? "User" : "Computer"

        const winnerSymbol = determineWinningCondition(board)
        let status, winner
        if (winnerSymbol != "")
        {
          status = "Finished"
          winner = (winnerSymbol == playerSymbol) ? "User" : ((winnerSymbol == "-") ? "" : "Computer")
          turn = null
        }

        const updateMutation = `mutation {
			updateGameState(
				id: "${id}"
				board: ${JSON.stringify(board)}
				${status ? `status: ${status}` : ''}
				${winner ? `winner: ${winner}` : ''}
				turn: ${turn}
			) { id }}`
        api.request(updateMutation)
      		.then(data => resolve({ data: event.data }))
      		.catch(err => resolve({ error: err}))
    	})
      .catch(err => resolve({ error: err}))
  })
}

function determineWinningCondition(board)
{
  	const boardValues = board.map(p => p == "X" ? 1 : (p == "O" ? -1 : 0))
    const scores = checkBoard(boardValues)
    let winnerSymbol = scores.has(-3) ? "O" : (scores.has(3) ? "X" : (new Set(boardValues).has(0) ? "" : "-"))
    return winnerSymbol
}

function checkBoard(input) {
  let squareSize = Math.sqrt(input.length);
  let arraySum = (arr) => arr.reduce((acc, cur) => acc + cur);
  let indexes = Array.from(Array(squareSize).keys());
  let rows = indexes.map(r => arraySum(indexes.map(i => input[squareSize * r + i])))
  let cols = indexes.map(c => arraySum(indexes.map(i => input[squareSize * i + c])))
  let diag1 = arraySum(indexes.map(i => input[squareSize * i + i]))
  let diag2 = arraySum(indexes.map(i => input[(squareSize - 1) * (i + 1)]))
  return new Set([...rows, ...cols, ...diag1, ...diag2]);
}
