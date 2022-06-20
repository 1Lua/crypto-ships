/**
 * Description of Incoming messages
 */

export type ClientToServerEvents = {
    userAuth: (args: { token: string }) => void

    connectToGame: (args: { id: string }) => void

    userReady: (args: { gameId: string; ready: boolean }) => void

    setUserHash: (args: { gameId: string; hash: string }) => void

    setUserSalt: (args: { gameId: string; salt: string }) => void

    setUserPlacement: (args: { gameId: string; placement: string }) => void

    userMakeMove: (args: { gameId: string; x: number; y: number }) => void

    userMoveResult: (args: {
        gameId: string
        x: number
        y: number
        hit: boolean
    }) => void
}
