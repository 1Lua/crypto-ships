import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { GameDto } from '../dtos/game.dto'
import { GameEntity } from '../entities/game.entity'

import { GameStatuses, UserResult } from './game-process'

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly _gameRepository: Repository<GameEntity>,
    ) {}

    async createGame(user1Id: string, user2Id: string): Promise<GameDto> {
        const game = this._gameRepository.create({
            user1: user1Id,
            user2: user2Id,
            status: GameStatuses.created,
            createdAt: Date.now(),
        })

        await this._gameRepository.save(game)

        return game
    }

    async getGame(id: string): Promise<GameDto | undefined> {
        return await this._gameRepository.findOne(id)
    }

    async updateGame(
        id: string,
        params: Partial<GameDto>,
    ): Promise<GameDto | void> {
        await this._gameRepository.update(id, params)
        return await this._gameRepository.findOne(id)
    }

    /**
     * Метод позволяет получить список последних игр
     *
     * @param count Количество игр
     * @param from
     * @param time Указывает с какого момента времени  (game.createdAt < time)
     */

    async getLastGames(
        count: number,
        from?: number,
        time?: number,
    ): Promise<GameDto[]> {
        const takeFrom = from !== undefined ? from : 0
        const fromTime = time !== undefined ? time : Date.now()

        const games = await this._gameRepository
            .createQueryBuilder('game')
            .where('game.status = :status', { status: GameStatuses.finished })
            .andWhere('game.createdAt < :fromTime', { fromTime })
            .orderBy('game.createdAt', 'DESC')
            .skip(takeFrom)
            .take(count)
            .getMany()
        return games
    }

    async getUserGames(
        userId: string,
        count: number,
        from?: number,
        time?: number,
    ): Promise<GameDto[]> {
        const takeFrom = from !== undefined ? from : 0
        const fromTime = time !== undefined ? time : Date.now()

        const games = await this._gameRepository
            .createQueryBuilder('game')
            .where('game.user1 = :userId', { userId })
            .orWhere('game.user2 = :userId', { userId })
            .andWhere('game.createdAt < :fromTime', { fromTime })
            .skip(takeFrom)
            .take(count)
            .getMany()
        return games
    }

    async setGameUserHash(
        gameId: string,
        userId: string,
        hash: string,
    ): Promise<GameDto> {
        if (!userId) {
            throw new Error('userId is undefined')
        }
        if (!hash) {
            throw new Error('hash is undefined')
        }

        const game = await this._gameRepository.findOne(gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        if (game.user1 === userId) {
            game.hash1 = hash
            await this._gameRepository.save(game)
            return game
        }

        if (game.user2 === userId) {
            game.hash2 = hash
            await this._gameRepository.save(game)
            return game
        }

        return game
    }

    async setGameUserPlacement(
        gameId: string,
        userId: string,
        placement: string,
    ): Promise<GameDto> {
        if (!userId) {
            throw new Error('userId is undefined')
        }
        if (!placement) {
            throw new Error('placement is undefined')
        }

        const game = await this._gameRepository.findOne(gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        if (game.user1 === userId) {
            game.placement1 = placement
            await this._gameRepository.save(game)
            return game
        }

        if (game.user2 === userId) {
            game.placement1 = placement
            await this._gameRepository.save(game)
            return game
        }

        return game
    }

    async setGameUserSalt(
        gameId: string,
        userId: string,
        salt: string,
    ): Promise<GameDto> {
        if (!userId) {
            throw new Error('userId is undefined')
        }
        if (!salt) {
            throw new Error('salt is undefined')
        }

        const game = await this._gameRepository.findOne(gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        if (game.user1 === userId) {
            game.salt1 = salt
            await this._gameRepository.save(game)
            return game
        }

        if (game.user2 === userId) {
            game.salt2 = salt
            await this._gameRepository.save(game)
            return game
        }

        return game
    }

    async setGameUserResult(
        gameId: string,
        userId: string,
        result: UserResult,
    ): Promise<GameDto> {
        if (!userId) {
            throw new Error('userId is undefined')
        }
        if (!result) {
            throw new Error('result is undefined')
        }

        const game = await this._gameRepository.findOne(gameId)

        if (!game) {
            throw new Error('Game not found')
        }

        if (game.user1 === userId) {
            game.result1 = result
            await this._gameRepository.save(game)
            return game
        }

        if (game.user2 === userId) {
            game.result2 = result
            await this._gameRepository.save(game)
            return game
        }

        return game
    }
    /*
    makeServerSign
    */
}
