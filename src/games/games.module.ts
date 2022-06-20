import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'

import { GameSelectionController } from './controllers/game-selection.controller'
import { GameEntity } from './entities/game.entity'
import { GameResolver } from './game.resolver'
import { GamesGateway } from './gateway/games.gateway'
import { GameLogicService } from './services/game-logic.service'
import { GameSelectionService } from './services/game-selection.service'
import { GameService } from './services/games.service'

@Module({
    imports: [TypeOrmModule.forFeature([GameEntity]), UsersModule, AuthModule],
    providers: [
        GameService,
        GameResolver,
        GameSelectionService,
        GamesGateway,
        GameLogicService,
    ],
    controllers: [GameSelectionController],
})
export class GameModule {}
