import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { GameEntity } from './entities/game.entity'

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly _gameRepository: Repository<GameEntity>,
    ) {}

    async createGame(user1: string, user2: string): Promise<GameEntity> {
        const game = this._gameRepository.create({
            user1,
            user2,
        })

        await this._gameRepository.save(game)

        return game
    }
}
