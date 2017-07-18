# TicTacToe GameServer

In this example, I have created a gameserver for the popular game Tic Tac Toe, completely in Graphcool. The example does not come with a client, because it will be used in another example, where I will build a Unity3D game frontend for it. However, you can play the game in the Graphcool Playground, because it does not need any client-side logic!

Tags for this example `Permissions`, `RP hook functions`, `graphql-request`.

## About the game design

For this game, our server needs the following functionalities:

#### Game server features
- A user can register with a player name
- A user can create a new game

#### Gameplay features
- Determine who will start the game
- Determine who's turn it is
- Determine the winning state
- A user can make a move
- The computer can make a move

#### Game rules
- A user can only make a move in his/her own game
- A user can only make a move if the game is still in progress
- A user can only make a move if it's his/her turn
- A user can only make a move if the position on the board is free

#### Game AI
- Computer needs to determine it's next move. Because the AI part is really not important in this example, it is not implemented, and the computer plays random moves. For anyone interested, google `tictactoe minimax` to see how it can be improved

## Implementation overview

A user can perform three actions:
- **Registration**. To easily authenticate a user, the project uses Anonymous Authentication. The 'secret' used for Anonymous Authentication is also the Player name.

- **Create game**. Creating a game requires two parameters: the `userId` and the `level` of the game. The level is not implemented, but could be used to set the difficulty level of the AI.

- **Make a move**. To make a move, we need: the `gameId` and the `position` on the board for the new move. The game rules are implemented using a permission query on the `Move` Type.

The server implementation uses the following logic:
- Whenever a game is created, a `GameState` node is created for that game to keep track of the progress. This is done in a Request Pipeline function.

- Whenever a move is made, the `GameState` is updated, and the winning condition is checked to see if we already have a winner. This is also done in a Request Pipeline function.

- A Server Side Subscription is used for the computer player. It keeps an eye on all `GameState` nodes that have their `turn` field set to `Computer`. The function determines the position for the next move, and fires a `createMove` mutation.

### Using `graphcool-lib`

The functions use `graphcool-lib` to communicate with the API endpoint. `graphcool-lib` is a convenience wrapper around `graphql-request`. The `fromEvent()` method is used to create the client, because that closely mimics the setup used for schema extensions.

## Setting up the project

### Schema
Use the `graphcool-cli` to create a new Graphcool project, based on the schema, and open the Console:
```bash
graphcool init --schema ./schema.graphql
graphcool console
```

### Permanent Authentication Token

Create a Permanent Authentication Token on the 'Authentication' tab of the 'Project Settings' page.

### Authentication

Enable 'Anonymous Authentication' on the `User` Type from the Integrations tab in the Console.

### Permissions
Next, set up the permissions. Start by deleting all existing Type and Relation permissions. Next, create the following permissions. The Query column points to the source file for the permission query.

| Type/Relation | Permission | Fields | Auth? | Query |
|---|---|---|:---:|---|
| Game | `READ` | `id` `level` |Yes | [read-game.graphql](./permissions/read-game.graphql) |
| Game | `CREATE` | `level` | Yes|- |
| Move | `CREATE`| `position` |Yes | [create-move.graphql](./permissions/create-move.graphql) |
| GameState | `READ` | `APPLY TO WHOLE TYPE` |Yes | [read-gamestate.graphql](./permissions/read-gamestate.graphql) |
| GameMove | `CONNECT` |- | Yes|- |
| GameOnUser |`CONNECT` | -|Yes |- |

### Functions
Create the following Request Pipeline functions. Replace the `__PAT__` and `__PROJECTID__` placeholders in the functions.   

| Type | Action | Hook | Function
|---|---|---|---|
| Game | `Created` | `TRANSFORM_PAYLOAD` | [create-gamestate-for-new-game.js](./functions/create-gamestate-for-new-game.js) |
| Move | `Created` | `PRE_WRITE` | [update-gamestate-on-move.js](./functions/update-gamestate-on-move.js) |

And the following Server Side subscription. Replace the `__PAT__` and `__PROJECTID__` placeholders in the functions.

| Type | Query | Function |
| --- | --- | --- |
| GameState | [computer-makes-move.graphql](./functions/computer-makes-move.graphql) | [computer-makes-move.js](./functions/computer-makes-move.js) |

## Running the game

You can run the game completely from the Graphcool Playground, but it requires some setting up.

First, authenticate yourself as a new player. You will need the `id` in the next step:
```graphql
mutation {
  authenticateAnonymousUser(secret: "PlayerName") {
    id
    token
  }
}
```

Next, set up a subscription to receive updates when the computer makes a move, replacing `__PLAYER_ID__` with the `id` from the previous step. Select the user you created using the `Select User` button in the Playground first.
```graphql
subscription {
  GameState(filter: {
      mutation_in: [CREATED, UPDATED],
      node: {
        game: {
          player: { id: "__PLAYER_ID__" }
        }
      }
    }) {
      node {
      game {
        id
      }
      playerSymbol
      board
      status
      turn
      winner
    }
  }
}
```
Start the subscription.

Now, we're ready to start a new game! Open a new tab in the Playground and create a new game, again replacing `__PLAYER_ID__` with the `id` of the user. You will need the `id` of the game in the next step. Again, select the user you created using the `Select User` button in the Playground first.
```graphql
mutation {
  createGame(playerId: "__PLAYER_ID__", level: Noob) {
    id
  }
}
```

If you go over to the subscription tab, you'll see one or two updates on the `GameState` (depending who gets to go first).

Now, let's make a move! Replace the `__GAME_ID__` with the `id` of the game you created before and pick a `position` for your move. Again, select the user you created using the `Select User` button in the Playground first.
```graphql
mutation {
  createMove(position: __POSITION__ gameId: "__GAME_ID__") {
    game
    {
      gameState{
        board
        winner
        turn
        status
      }
    }
  }
}
```

Moving over to the subscription tab again, you'll notice two more updates to the `GameState`, one from your own move, and one from the computer.

Keep making moves until the game is finished. The response from `createMove` will show you the winner!
