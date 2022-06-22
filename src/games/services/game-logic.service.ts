import { Injectable } from '@nestjs/common'

import { JwtAuthService } from 'src/auth/jwt.auth.service'

import { GamesGatewayError, Socket } from '../gateway/games/magic-of-gateway'

import {
    GameId,
    GameProcess,
    GameStatuses,
    GameVerify,
    MaxGameFieldSize,
    MaxShipCells,
} from './game-process'
import { GameService } from './games.service'

@Injectable()
export class GameLogicService {
    private readonly _activeGames = new Map<GameId, GameProcess>()

    constructor(
        private readonly _jwtAuthService: JwtAuthService,
        private readonly _gameService: GameService,
    ) {}

    addGameToActive(gameId: string, gameProcess: GameProcess): void {
        this._activeGames.set(gameId, gameProcess)
    }

    getActiveGame(gameId: string): GameProcess | undefined {
        return this._activeGames.get(gameId)
    }

    deleteGameFromActive(gameId: string): void {
        this._activeGames.delete(gameId)
    }

    /**
     * This returns the GameProcess from the active games,
     * Or creates a new GameProcess object from the GameDto
     * that will be retrieved from the database.
     * @param gameId
     * @returns Promise<GameProcess | void>
     */

    async getGameAsGameProcess(gameId: string): Promise<GameProcess | void> {
        let gameProcess = this._activeGames.get(gameId)
        if (gameProcess) {
            return gameProcess
        }
        const gameDto = await this._gameService.getGame(gameId)
        if (gameDto) {
            gameProcess = new GameProcess(gameDto)
            return gameProcess
        }
        return undefined
    }

    /**
     * This throws new GamesGatewayError("userAuthError", "User is not authorized")
     * @param client
     */

    async authUser(token: string, cli: Socket): Promise<void> {
        const client = cli
        let payload
        try {
            payload = await this._jwtAuthService.decodeJWT(token)
            const userId = payload.sub

            client.data.userId = userId
            client.data.isAuth = true
            client.emit('successAuth', { message: 'Success Authentication' })
        } catch (err) {
            throw new GamesGatewayError('userAuthError', 'Token is invalid')
        }
    }

    /**
     * This throws new GamesGatewayError("userAuthError", "User is not authorized", client)
     * if user is not authorized
     * @param client
     */

    userIsAuth(client: Socket): { userId: string; isAuth: boolean } {
        const { userId, isAuth } = client.data

        if (!isAuth) {
            throw new GamesGatewayError(
                'userAuthError',
                'User is not authorized',
            )
        }

        if (!userId) {
            throw new GamesGatewayError(
                'userAuthError',
                'User is not authorized',
            )
        }

        return { userId, isAuth }
    }

    async onSuccessConnectToGame(
        gameProcess: GameProcess,
        userId: string,
        client: Socket,
    ): Promise<void> {
        const ids = gameProcess.getLocalUserId(userId)

        if (!ids) {
            return undefined
        }

        // const clientId = ids.userGameId
        const enemyId = ids.enemyGameId

        gameProcess.emitToUser(enemyId, 'enemyIsConnected', {
            message: 'Enemy is connected to game',
        })

        if (gameProcess.status === GameStatuses.waitingForReady) {
            client.emit('waitingForReady', {
                message: 'Server is waiting you ready',
            })
            return undefined
        }

        if (gameProcess.status === GameStatuses.waitingForHash) {
            client.emit('waitingForHash', {
                message: 'Server is waiting hash from you',
            })
            return undefined
        }

        return undefined
    }

    async connectToGame(gameId: string, client: Socket): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError(
                'connectToGameError',
                'Game id was expected',
            )
        }

        const { userId } = this.userIsAuth(client)
        const gameProcess = await this.getGameAsGameProcess(gameId)
        if (!gameProcess) {
            throw new GamesGatewayError('connectToGameError', 'Game not found')
        }
        if (
            userId !== gameProcess.users[0].userId &&
            userId !== gameProcess.users[1].userId
        ) {
            throw new GamesGatewayError(
                'connectToGameError',
                'User havent access to this game',
            )
        }
        this.addGameToActive(gameId, gameProcess)
        gameProcess.setUserClient(userId, client)
        client.emit('successConnectToGame', {
            message: 'Success connection to the game',
        })
        this.onSuccessConnectToGame(gameProcess, userId, client)
    }

    /**
     * This throws new GamesGatewayError("connectToGameError", "User dont connected to this game", client)
     * if user dont connected to game, or new GamesGatewayError("userAuthError", "User is not authorized", client)
     * if user is not authorized
     * @param gameId
     * @param client
     */

    userIsConnectedToGame(
        gameId: string,
        client: Socket,
    ): { userId: string; isAuth: boolean; gameProcess: GameProcess } {
        const { userId, isAuth } = this.userIsAuth(client)
        const gameProcess = this.getActiveGame(gameId)
        if (!gameProcess) {
            throw new GamesGatewayError(
                'connectToGameError',
                'User dont connected to this game',
            )
        }
        return { userId, isAuth, gameProcess }
    }

    async onUserReady(
        gameId: string,
        ready: boolean,
        client: Socket,
    ): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError('userReadyError', 'gameId was expected')
        }

        const { gameProcess, userId } = this.userIsConnectedToGame(
            gameId,
            client,
        )
        if (!ready) {
            throw new GamesGatewayError(
                'userReadyError',
                'Expected ready equals true',
            )
        }

        if (gameProcess.status > GameStatuses.waitingForReady) {
            throw new GamesGatewayError(
                'userReadyError',
                'Game is already running',
            )
        }

        gameProcess.setUserReady(userId, ready)
        if (gameProcess.isUsersReady()) {
            const status = GameStatuses.waitingForHash
            await this._gameService.updateGame(gameId, { status })
            gameProcess.setStatus(status)
            gameProcess.emitToClients('waitingForHash', {
                message: 'Server is waiting hash from you',
            })
        }
    }

    async onSetUserHash(
        gameId: string,
        hash: string,
        client: Socket,
    ): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError('userHashError', 'gameId was expected')
        }
        if (hash === undefined) {
            throw new GamesGatewayError('userHashError', 'Hash was expected')
        }
        const { gameProcess, userId } = this.userIsConnectedToGame(
            gameId,
            client,
        )

        if (gameProcess.status !== GameStatuses.waitingForHash) {
            throw new GamesGatewayError('userHashError', 'Unexpected hash')
        }

        try {
            await this._gameService.setGameUserHash(gameId, userId, hash)
        } catch (err) {
            throw new GamesGatewayError('userHashError', 'Incorrect hash')
        }

        gameProcess.setUserHash(userId, hash)
        if (gameProcess.isUsersHaveHash()) {
            await this._gameService.updateGame(gameId, {
                status: GameStatuses.fighting,
            })
            gameProcess.emitToClients('gameStarted', {
                message: 'Game was started',
            })
        }
    }

    private async _createUserMove(
        gameProcess: GameProcess,
        userId: string,
        x: number,
        y: number,
    ): Promise<void> {
        gameProcess.history.push(userId, x, y)
        const history = gameProcess.history.toJSON()
        if (history) {
            await this._gameService.updateGame(gameProcess.gameId, { history })
            const localIds = gameProcess.getLocalUserId(userId)
            if (localIds) {
                gameProcess.emitToClients('waitingForMoveResult', {
                    userId: gameProcess.users[localIds.enemyGameId].userId,
                    x,
                    y,
                })
            }
        }
    }

    async onUserMakeMove(
        gameId: string,
        x: number,
        y: number,
        client: Socket,
    ): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError(
                'userMakeMoveError',
                'gameId was expected',
            )
        }

        if (x === undefined) {
            throw new GamesGatewayError('userMakeMoveError', 'x was expected')
        }

        if (y === undefined) {
            throw new GamesGatewayError('userMakeMoveError', 'y was expected')
        }

        if (x < 0 || x > MaxGameFieldSize - 1) {
            throw new GamesGatewayError(
                'userMakeMoveError',
                'x can take a value from 0 to 9',
            )
        }

        if (y < 0 || y > MaxGameFieldSize - 1) {
            throw new GamesGatewayError(
                'userMakeMoveError',
                'y can take a value from 0 to 9',
            )
        }

        const { gameProcess, userId } = this.userIsConnectedToGame(
            gameId,
            client,
        )

        if (gameProcess.status !== GameStatuses.fighting) {
            throw new GamesGatewayError(
                'userMakeMoveError',
                'Game is not running',
            )
        }

        const lastMove = gameProcess.history.getLastMove()
        if (!lastMove) {
            // В игре еще никто не ходил
            if (gameProcess.users[0].userId === userId) {
                // Первый ход совершает первый игрок
                await this._createUserMove(gameProcess, userId, x, y)
                return undefined
            }

            throw new GamesGatewayError(
                'userMakeMoveError',
                'The enemy move is expected',
            )
        }

        if (lastMove.hit === undefined) {
            // Ожидается подвеждение попадания последнего хода
            if (lastMove.userId === userId) {
                throw new GamesGatewayError(
                    'userMakeMoveError',
                    'Your move result is waiting from enemy',
                )
            } else {
                throw new GamesGatewayError(
                    'userMakeMoveError',
                    'Enemy move result is waiting from your',
                )
            }
        }

        if (lastMove.hit === true) {
            // последний ход успешный
            if (lastMove.userId === userId) {
                if (gameProcess.history.findMove(userId, x, y)) {
                    // Данный ход уже существует
                    throw new GamesGatewayError(
                        'userMakeMoveError',
                        'This move already exists',
                    )
                }

                this._createUserMove(gameProcess, userId, x, y)
                return undefined
            }
            throw new GamesGatewayError(
                'userMakeMoveError',
                'The enemy move is expected',
            )
        }

        return undefined
    }

    private async _setLastMoveResult(
        gameProcess: GameProcess,
        hit: boolean,
    ): Promise<void> {
        gameProcess.history.setHitToLastMove(hit)
        const history = gameProcess.history.toJSON()
        if (history) {
            await this._gameService.updateGame(gameProcess.gameId, { history })
        }
    }

    async onUserMoveResult(
        gameId: string,
        x: number,
        y: number,
        hit: boolean,
        client: Socket,
    ): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError(
                'userMoveResultError',
                'gameId was expected',
            )
        }

        if (x === undefined) {
            throw new GamesGatewayError('userMoveResultError', 'x was expected')
        }

        if (y === undefined) {
            throw new GamesGatewayError('userMoveResultError', 'y was expected')
        }

        if (hit === undefined) {
            throw new GamesGatewayError(
                'userMoveResultError',
                'hit was expected',
            )
        }

        if (x < 0 || x > MaxGameFieldSize - 1) {
            throw new GamesGatewayError(
                'userMoveResultError',
                'x can take a value from 0 to 9',
            )
        }

        if (y < 0 || y > MaxGameFieldSize - 1) {
            throw new GamesGatewayError(
                'userMoveResultError',
                'y can take a value from 0 to 9',
            )
        }

        const { gameProcess, userId } = this.userIsConnectedToGame(
            gameId,
            client,
        )

        if (gameProcess.status !== GameStatuses.fighting) {
            throw new GamesGatewayError(
                'userMoveResultError',
                'Game is not running',
            )
        }

        const lastMove = gameProcess.history.getLastMove()
        if (!lastMove) {
            // В игре еще никто не ходил
            if (gameProcess.users[0].userId === userId) {
                throw new GamesGatewayError(
                    'userMoveResultError',
                    'Your move is expected',
                )
            }
            throw new GamesGatewayError(
                'userMoveResultError',
                'Enemy move is expected',
            )
        }

        if (lastMove.hit !== undefined) {
            if (lastMove.hit === true) {
                // В последнем ходе уже есть попадание
                if (lastMove.userId === userId) {
                    throw new GamesGatewayError(
                        'userMoveResultError',
                        'Your move is expected',
                    )
                }
                throw new GamesGatewayError(
                    'userMoveResultError',
                    'Enemy move is expected',
                )
            }
        }

        if (lastMove.hit === undefined) {
            if (lastMove.userId === userId) {
                // попытка подтвердить свой собственный ход
                throw new GamesGatewayError(
                    'userMoveResultError',
                    "You can't confirm your own move",
                )
            }
            if (lastMove.move.x !== x || lastMove.move.y !== y) {
                throw new GamesGatewayError(
                    'userMoveResultError',
                    'Incorrect last move coordinates',
                )
            }
        }

        await this._setLastMoveResult(gameProcess, hit)

        const localIds = gameProcess.getLocalUserId(userId)
        if (localIds) {
            const countOfUserHits = gameProcess.history.getCountOfHits(
                gameProcess.users[localIds.enemyGameId].userId,
            )

            if (countOfUserHits === MaxShipCells) {
                // game is end
                await this._gameService.updateGame(gameId, {
                    status: GameStatuses.waitingForPlacement,
                })
                gameProcess.status = GameStatuses.waitingForPlacement
                gameProcess.emitToClients('waitingForPlacement', {
                    message: 'Server is waiting placement from you',
                })
                return undefined
            }

            if (hit === true) {
                gameProcess.emitToClients('waitingForMove', {
                    userId: gameProcess.users[localIds.enemyGameId].userId,
                })
                return undefined
            }

            if (hit === false) {
                gameProcess.emitToClients('waitingForMove', { userId })
            }
        }

        return undefined
    }

    async setUserPlacement(
        gameId: string,
        placement: string,
        client: Socket,
    ): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError(
                'userPlacementError',
                'gameId was expected',
            )
        }
        if (placement === undefined) {
            throw new GamesGatewayError(
                'userPlacementError',
                'Placement was expected',
            )
        }

        const { gameProcess, userId } = this.userIsConnectedToGame(
            gameId,
            client,
        )

        if (gameProcess.status !== GameStatuses.waitingForHash) {
            throw new GamesGatewayError(
                'userPlacementError',
                'Unexpected placement',
            )
        }

        const gameField = GameVerify.verifyPlacementFormat(placement)
        if (!gameField) {
            throw new GamesGatewayError(
                'userPlacementError',
                'Incorrect placement format',
            )
        }

        const shipSumVerify = GameVerify.checkShipSum(gameField)
        if (!shipSumVerify) {
            gameProcess.setUserResult(userId, 'Incorrect placement')
            await this._gameService.setGameUserResult(
                gameId,
                userId,
                'Incorrect placement',
            )
            throw new GamesGatewayError(
                'userPlacementError',
                'Incorrect placement',
            )
        }

        const shipCollisionVerify =
            GameVerify.checkDiagonalShipCollision(gameField)
        if (!shipCollisionVerify) {
            gameProcess.setUserResult(userId, 'Incorrect placement')
            await this._gameService.setGameUserResult(
                gameId,
                userId,
                'Incorrect placement',
            )
            throw new GamesGatewayError(
                'userPlacementError',
                'Incorrect placement',
            )
        }

        await this._gameService.setGameUserPlacement(gameId, userId, placement)
        gameProcess.setUserPlacement(userId, placement)

        client.emit('acceptPlacement', { message: 'ok' })

        if (gameProcess.isUsersHavePlacement()) {
            await this._gameService.updateGame(gameId, {
                status: GameStatuses.waitingForPlacement,
            })
            gameProcess.status = GameStatuses.waitingForPlacement
            gameProcess.emitToClients('waitingForSalt', {
                message: 'Server is waiting salt from you',
            })
        }
    }

    async checkGameFinish(gameProcess: GameProcess): Promise<void> {
        if (gameProcess.isUsersHaveResult()) {
            if (
                gameProcess.users[0].result === 'Ok' &&
                gameProcess.users[1].result === 'Ok'
            ) {
                const lastHit = gameProcess.history.getLastMove()
                if (lastHit) {
                    gameProcess.setWinner(lastHit.userId)
                    gameProcess.setStatus(GameStatuses.finished)
                    await this._gameService.updateGame(gameProcess.gameId, {
                        winner: lastHit.userId,
                        status: GameStatuses.finished,
                    })
                }
            }

            if (
                gameProcess.users[0].result === 'Ok' &&
                gameProcess.users[1].result !== 'Ok'
            ) {
                gameProcess.setWinner(gameProcess.users[0].userId)
                gameProcess.setStatus(GameStatuses.finished)
                await this._gameService.updateGame(gameProcess.gameId, {
                    winner: gameProcess.users[0].userId,
                    status: GameStatuses.finished,
                })
            }

            if (
                gameProcess.users[0].result !== 'Ok' &&
                gameProcess.users[1].result === 'Ok'
            ) {
                gameProcess.setWinner(gameProcess.users[1].userId)
                gameProcess.setStatus(GameStatuses.finished)
                await this._gameService.updateGame(gameProcess.gameId, {
                    winner: gameProcess.users[1].userId,
                    status: GameStatuses.finished,
                })
            }

            if (
                gameProcess.users[0].result !== 'Ok' &&
                gameProcess.users[1].result !== 'Ok'
            ) {
                gameProcess.setStatus(GameStatuses.finished)
                await this._gameService.updateGame(gameProcess.gameId, {
                    status: GameStatuses.finished,
                })
            }

            gameProcess.emitToClients('gameFinished', {
                message: 'Game was finished',
                winner: gameProcess.winner,
            })

            this.deleteGameFromActive(gameProcess.gameId)
        }
        return undefined
    }

    async onSetUserSalt(
        gameId: string,
        salt: string,
        client: Socket,
    ): Promise<void> {
        if (gameId === undefined) {
            throw new GamesGatewayError('userSaltError', 'gameId was expected')
        }
        if (salt === undefined) {
            throw new GamesGatewayError('userSaltError', 'salt was expected')
        }
        const { gameProcess, userId } = this.userIsConnectedToGame(
            gameId,
            client,
        )

        if (gameProcess.status !== GameStatuses.waitingForHash) {
            throw new GamesGatewayError('userSaltError', 'Unexpected salt')
        }

        if (!GameVerify.verifySalt(salt)) {
            gameProcess.setUserResult(userId, 'Incorrect salt')
            await this._gameService.setGameUserResult(
                gameId,
                userId,
                'Incorrect salt',
            )
            throw new GamesGatewayError('userSaltError', 'Incorrect salt')
        }

        const localId = gameProcess.getLocalUserId(userId)
        if (!localId) {
            throw new GamesGatewayError(
                'connectToGameError',
                'User dont connected to this game',
            )
        }

        const userData = gameProcess.users[localId.userGameId]
        const { hash, placement } = userData
        let hashVerify = false
        if (hash && placement) {
            hashVerify = GameVerify.verifyHash(hash, placement, salt)
        }

        if (!hashVerify) {
            gameProcess.setUserResult(userId, 'Hashes are not equals')
            await this._gameService.setGameUserResult(
                gameId,
                userId,
                'Hashes are not equals',
            )
            throw new GamesGatewayError(
                'userHashError',
                'Hashes are not equals',
            )
        }

        gameProcess.setUserResult(userId, 'Ok')
        await this._gameService.setGameUserResult(gameId, userId, 'Ok')

        await this.checkGameFinish(gameProcess)
    }
}
