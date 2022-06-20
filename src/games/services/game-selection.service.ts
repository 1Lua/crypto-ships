import { Injectable, Logger } from '@nestjs/common'
import { Response } from 'express'

import { UserDto } from 'src/users/dto/user.dto'

import { GameDto } from '../dtos/game.dto'

import { GameService } from './games.service'

const USERS_QUERY_INTERVAL = 5000

type Subscriber = {
    user: UserDto
    res: Response
}

@Injectable()
export class GameSelectionService {
    private readonly _usersQuery: UserDto[] = []
    private readonly _usersQueryInterval
    private readonly _logger = new Logger(GameSelectionService.name)
    private readonly _subscribers: Subscriber[] = []

    constructor(private readonly _gameService: GameService) {
        this._usersQueryInterval = setInterval(() => {
            this.matchingPlayers()
        }, USERS_QUERY_INTERVAL)
    }

    onApplicationShutdown(): void {
        clearInterval(this._usersQueryInterval)
    }

    async matchingPlayers(): Promise<void> {
        // this._logger.log(this._usersQuery)

        const TWO = 2
        const count = this._usersQuery.length
        const pairs = (count - (count % TWO)) / TWO // Максимальное количество пар

        const proms: Promise<GameDto>[] = []

        for (let i = 0; i < pairs * TWO; i += TWO) {
            const user1 = this._usersQuery[i]
            const user2 = this._usersQuery[i + 1]

            if (!user1) {
                throw new Error()
            }

            if (!user2) {
                throw new Error()
            }

            const prom = this._gameService.createGame(user1.id, user2.id)
            prom.then((game: GameDto) => {
                this._subscribers.forEach((subscriber) => {
                    if (
                        subscriber.user.id === user1.id ||
                        subscriber.user.id === user2.id
                    ) {
                        try {
                            subscriber.res.send(String(game.id))
                        } catch (error) {
                            this._logger.error('Message didnt sended')
                        }
                    }
                })
            })
            proms.push(prom)
        }

        Promise.all(proms)
        this._usersQuery.splice(0, pairs * TWO)

        if (this._usersQuery.length > 0) {
            const user = this._usersQuery[0]
            if (user) {
                this._subscribers.forEach((subscriber, id) => {
                    if (subscriber.user.id === user.id) {
                        this._subscribers.splice(0, id)
                        this._subscribers.splice(
                            1,
                            this._subscribers.length - 1,
                        )
                    }
                })
            }
        }
    }

    addUserToQuery(user: UserDto): void {
        this._usersQuery.push(user)
    }

    removeUserFromQuery(rUser: UserDto): void {
        this._usersQuery.forEach((user, id) => {
            if (user.id === rUser.id) {
                this._usersQuery.splice(id, 1)
            }
        })
    }

    addSubscriber(user: UserDto, res: Response): void {
        this._subscribers.push({ user, res })
    }

    removeSubsciber(rUser: UserDto): void {
        this._subscribers.map(
            (subscriber) => subscriber.user.id !== rUser.id && subscriber,
        )
        this._subscribers.forEach((subscriber, id) => {
            if (subscriber.user.id === rUser.id) {
                const INTERNAL_ERROR = 500
                try {
                    subscriber.res.sendStatus(INTERNAL_ERROR)
                } catch (err) {
                    this.doNothing(err)
                }
                this._subscribers.splice(id, 1)
            }
        })
    }

    doNothing(param: string): string {
        return param
    }
}
