// Outcoming packets

/**
 * Only {message: string} consists in args
 */

export interface ServerToClientErrors {
    userAuthError: (args: {
        message:
            | 'Token is expected'
            | 'Token is invalid'
            | 'User is not authorized'
    }) => void

    connectToGameError: (args: {
        message:
            | 'Game not found'
            | 'User havent access to this game'
            | 'User dont connected to this game'
            | 'Game is already finished'
            | 'Game id was expected'
    }) => void

    userReadyError: (args: {
        message:
            | 'Game is already running'
            | 'Expected ready equals true'
            | 'gameId was expected'
    }) => void

    userHashError: (args: {
        message:
            | 'Hash was expected'
            | 'Incorrect hash'
            | 'Unexpected hash'
            | 'gameId was expected'
            | 'Hashes are not equals'
    }) => void

    userMakeMoveError: (args: {
        message:
            | 'gameId was expected'
            | 'The enemy move is expected'
            | 'x was expected'
            | 'y was expected'
            | 'x can take a value from 0 to 9'
            | 'y can take a value from 0 to 9'
            | 'Game is not running'
            | 'Your move result is waiting from enemy'
            | 'Enemy move result is waiting from your'
            | 'This move already exists'
    }) => void

    userMoveResultError: (args: {
        message:
            | 'gameId was expected'
            | 'The enemy move result is expected'
            | 'x was expected'
            | 'y was expected'
            | 'x can take a value from 0 to 9'
            | 'y can take a value from 0 to 9'
            | 'Game is not running'
            | 'hit was expected'
            | 'Your move is expected'
            | 'Enemy move is expected'
            | "You can't confirm your own move"
            | 'Incorrect last move coordinates'
    }) => void

    userPlacementError: (args: {
        message:
            | 'Placement was expected'
            | 'Incorrect placement format'
            | 'Unexpected placement'
            | 'gameId was expected'
            | 'Incorrect placement'
            | 'Fake placement'
    }) => void

    userSaltError: (args: {
        message:
            | 'salt was expected'
            | 'Incorrect salt'
            | 'Unexpected salt'
            | 'gameId was expected'
    }) => void
}

export type ServerToClientEvents = ServerToClientErrors & {
    waitingForAuth: (args: {
        message: 'Server is waiting token from you'
    }) => void

    successAuth: (args: { message: 'Success Authentication' }) => void

    successConnectToGame: (args: {
        message: 'Success connection to the game'
    }) => void

    enemyIsConnected: (args: { message: 'Enemy is connected to game' }) => void

    waitingForReady: (args: {
        message: 'Server is waiting you ready' | 'Server is waiting enemy ready'
    }) => void

    waitingForHash: (args: {
        message:
            | 'Server is waiting hash from you'
            | 'Server is waiting hash from enemy'
    }) => void

    gameStarted: (args: { message: 'Game was started' }) => void

    waitingForMove: (args: { userId: string }) => void

    waitingForMoveResult: (args: {
        userId: string
        x: number
        y: number
    }) => void

    waitingForPlacement: (args: {
        message: 'Server is waiting placement from you'
    }) => void

    acceptPlacement: (args: { message: 'ok' }) => void

    waitingForSalt: (args: {
        message: 'Server is waiting salt from you'
    }) => void

    gameFinished: (args: {
        winner?: string
        message: 'Game was finished'
    }) => void
}
