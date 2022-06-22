import * as Crypto from 'crypto'

import { GameDto } from '../dtos/game.dto'
import {
    ServerToClientEventsNames,
    ServerToClientEventsParameters,
    Socket,
} from '../gateway/games/magic-of-gateway'

export const MaxGameFieldSize = 10 // field has 10x10 cells
export const MaxShipCells = 20
export const HashLength = 64
export const MaxHashLenght = 128

const Ship4Sum = 1
const Ship3Sum = 4
const Ship2Sum = 10
const Ship1Sum = MaxShipCells // 20

export const ShipsSum = [0, Ship1Sum, Ship2Sum, Ship3Sum, Ship4Sum]

export type UserResult =
    | 'Ok'
    | 'Incorrect placement'
    | 'Fake placement'
    | 'Incorrect salt'
    | 'Hashes are not equals'

export type GameId = string

export interface GameHistoryRecord {
    userId: string
    move: { x: number; y: number }
    hit?: boolean
}

export class GameHistory {
    private _history: GameHistoryRecord[] = []

    get(): GameHistoryRecord[] {
        return this._history
    }

    push(userId: string, x: number, y: number): void {
        this._history.push({ userId, move: { x, y } })
    }

    setHitToLastMove(hit: boolean): void {
        const record = this._history.pop()
        if (record) {
            record.hit = hit
            this._history.push(record)
        }
    }

    getLastMove(): GameHistoryRecord | undefined {
        const record = this._history.pop()
        if (record) {
            this._history.push(record)
            return record
        }
        return undefined
    }

    findMove(userId: string, x: number, y: number): boolean {
        for (const record of this._history) {
            if (
                record.userId === userId &&
                record.move.x === x &&
                record.move.y === y
            ) {
                return true
            }
        }

        return false
    }

    toJSON(): string | undefined {
        if (this._history.length > 0) {
            return JSON.stringify(this._history)
        }
        return undefined
    }

    fromJSON(json: string | undefined): void {
        if (json) {
            const history = JSON.parse(json) as GameHistoryRecord[]
            this._history = history
        }
    }

    getCountOfHits(userId: string): number {
        let count = 0
        for (const record of this._history) {
            if (record.userId === userId && record.hit) {
                count += 1
            }
        }
        return count
    }
}

export interface UserGameData {
    userId: string
    client?: Socket
    ready: boolean
    hash?: string
    placement?: string
    salt?: string
    result?: string
}

export enum GameStatuses {
    created,
    waitingForReady,
    waitingForHash,
    fighting,
    waitingForPlacement,
    waitingForSalt,
    finished,
}

export class GameProcess {
    lastAction: number
    gameId: string
    status: number
    createdAt: number
    users: [UserGameData, UserGameData]
    history = new GameHistory()
    winner?: string

    constructor(game: GameDto) {
        this.gameId = game.id
        this.status = game.status
        this.createdAt = game.createdAt
        this.history.fromJSON(game.history)
        this.winner = game.winner

        const ready = this.status > GameStatuses.waitingForReady

        const user1: UserGameData = {
            userId: game.user1,
            hash: game.hash1,
            ready,
            placement: game.placement1,
            salt: game.salt1,
            result: game.result1,
        }

        const user2: UserGameData = {
            userId: game.user2,
            hash: game.hash2,
            ready,
            placement: game.placement2,
            salt: game.salt2,
            result: game.result2,
        }
        this.users = [user1, user2]
        this.lastAction = Date.now()
    }

    emitToClients<T extends ServerToClientEventsNames>(
        name: T,
        ...args: ServerToClientEventsParameters<T>
    ): void {
        if (this.users[0].client) {
            this.users[0].client.emit(name, ...args)
        }
        if (this.users[1].client) {
            this.users[1].client.emit(name, ...args)
        }
    }

    emitToUser<T extends ServerToClientEventsNames>(
        localId: 0 | 1,
        name: T,
        ...args: ServerToClientEventsParameters<T>
    ): void {
        const { client } = this.users[localId]
        if (client) {
            client.emit(name, ...args)
        }
    }

    /*
    getDto(): GameDto {
        const game: GameDto = {
            id: this.gameId,
            user1: this.users[0].userId,
            user2: this.users[1].userId,
            status: this.status,
            createdAt: this.createdAt,
            history: this.history.toJSON()
        }
        return game
    } */

    setStatus(status: number): void {
        this.status = status
    }

    setUserClient(userId: string, client: Socket): void {
        if (this.users[0].userId === userId) {
            this.users[0].client = client
        }
        if (this.users[1].userId === userId) {
            this.users[1].client = client
        }
    }

    getLocalUserId(
        userId: string,
    ): { userGameId: 0 | 1; enemyGameId: 0 | 1 } | undefined {
        if (this.users[0].userId === userId) {
            return {
                userGameId: 0,
                enemyGameId: 1,
            }
        }

        if (this.users[1].userId === userId) {
            return {
                userGameId: 1,
                enemyGameId: 0,
            }
        }

        return undefined
    }

    setUserReady(userId: string, ready: boolean): void {
        if (this.users[0].userId === userId) {
            this.users[0].ready = ready
        }
        if (this.users[1].userId === userId) {
            this.users[1].ready = ready
        }
    }

    isUsersReady(): boolean {
        return this.users[0].ready && this.users[1].ready
    }

    setUserHash(userId: string, hash: string): void {
        if (this.users[0].userId === userId) {
            this.users[0].hash = hash
        }
        if (this.users[1].userId === userId) {
            this.users[1].hash = hash
        }
    }

    isUsersHaveHash(): boolean {
        if (!this.users[0].hash) {
            return false
        }
        if (!this.users[1].hash) {
            return false
        }
        return true
    }

    setUserPlacement(userId: string, placement: string): void {
        if (this.users[0].userId === userId) {
            this.users[0].placement = placement
        }
        if (this.users[1].userId === userId) {
            this.users[1].placement = placement
        }
    }

    isUsersHavePlacement(): boolean {
        if (!this.users[0].placement) {
            return false
        }
        if (!this.users[1].placement) {
            return false
        }
        return true
    }

    setUserSalt(userId: string, salt: string): void {
        if (this.users[0].userId === userId) {
            this.users[0].salt = salt
        }
        if (this.users[1].userId === userId) {
            this.users[1].salt = salt
        }
    }

    isUsersHaveSalt(): boolean {
        if (!this.users[0].salt) {
            return false
        }
        if (!this.users[1].salt) {
            return false
        }
        return true
    }

    setUserResult(userId: string, result: UserResult): void {
        if (this.users[0].userId === userId) {
            this.users[0].result = result
        }
        if (this.users[1].userId === userId) {
            this.users[1].result = result
        }
    }

    isUsersHaveResult(): boolean {
        if (!this.users[0].result) {
            return false
        }
        if (!this.users[1].result) {
            return false
        }
        return true
    }

    setWinner(userId: string): void {
        this.winner = userId
    }
}

export type GameField = number[][]

export class GameVerify {
    static verifyHashFromat(hash: string): boolean {
        const match = hash.match(/[0-9a-f]+/g)
        if (match !== null) {
            const res = match[0]
            if (res) {
                if (res.length === HashLength) {
                    return true
                }
            }
        }

        return false
    }

    static verifyPlacementFormat(placement: string): GameField | undefined {
        const match = placement.match(/[01]+/g)
        if (match !== null) {
            const res = match[0]
            if (res) {
                if (res.length === MaxGameFieldSize * MaxGameFieldSize) {
                    const split = placement.split('')
                    const field: GameField = []
                    for (let y = 0; y < MaxGameFieldSize; y += 1) {
                        const horizontalLine: number[] = []
                        for (let x = 0; x < MaxGameFieldSize; x += 1) {
                            horizontalLine.push(
                                Number(split[y * MaxGameFieldSize + x]),
                            )
                        }
                        field.push(horizontalLine)
                    }
                    return field
                }
            }
        }

        return undefined
    }

    static checkShipSum(field: GameField): boolean {
        const sum: number[] = []
        for (let size = MaxGameFieldSize; size > 0; size -= 1) {
            sum[size] = 0

            for (let i = 0; i < MaxGameFieldSize; i += 1) {
                for (let j = 0; j <= MaxGameFieldSize - size; j += 1) {
                    let vertical = true

                    for (let m = 0; m < size; m += 1) {
                        const line = field[j + m]
                        if (line) {
                            vertical = vertical && line[i] === 1
                        } else {
                            vertical = false
                        }
                    }

                    if (vertical) {
                        sum[size] += 1
                    }

                    let horisontal = true

                    for (let m = 0; m < size; m += 1) {
                        const line = field[i]
                        if (line) {
                            horisontal = horisontal && line[j + m] === 1
                        } else {
                            horisontal = false
                        }
                    }

                    if (horisontal && size !== 1) {
                        sum[size] += 1
                    }
                }
            }
        }
        let result = true
        for (let size = 1; size <= MaxGameFieldSize; size += 1) {
            const origin = ShipsSum[size] ? ShipsSum[size] : 0
            result = result && sum[size] === origin
        }
        return result
    }

    static checkDiagonalShipCollision(field: GameField): boolean {
        let result = true

        function checkCoordinates(x: number, y: number): boolean {
            if (
                x < 0 ||
                x >= MaxGameFieldSize ||
                y < 0 ||
                y >= MaxGameFieldSize
            ) {
                return true
            }
            const line = field[y]
            if (line) {
                if (line[x] !== 1) {
                    return true
                }
                return false
            }
            return true
        }

        for (let y = 0; y < MaxGameFieldSize; y += 1) {
            const line = field[y]
            if (line) {
                for (let x = 0; x < MaxGameFieldSize; x += 1) {
                    if (line[x] === 1) {
                        result =
                            result &&
                            checkCoordinates(x + 1, y - 1) &&
                            checkCoordinates(x - 1, y - 1) &&
                            checkCoordinates(x - 1, y + 1) &&
                            checkCoordinates(x + 1, y + 1)
                    }
                }
            }
        }

        return result
    }

    static verifyHistory(
        gameHistory: GameHistory,
        userField: GameField,
        userId: string,
    ): boolean {
        const history = gameHistory.get()
        for (const record of history) {
            if (record.userId !== userId && record.hit === true) {
                const line = userField[record.move.y]
                if (line) {
                    const cell = line[record.move.x]
                    if (cell !== 1) {
                        return false
                    }
                }
            }
        }
        return true
    }

    static verifySalt(salt: string): boolean {
        if (!salt) {
            return false
        }
        return salt.length <= MaxHashLenght
    }

    static verifyHash(hash: string, placement: string, salt: string): boolean {
        const str = `${placement}|${salt}`
        const hashSum = Crypto.createHash('sha256').update(str).digest('hex')
        return hashSum === hash
    }
    /*
    verifyPlacement(placement, history)
    verifyHash(placement, salt)
    */
}
