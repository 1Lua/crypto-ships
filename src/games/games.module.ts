import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'

import { GameSelectionController } from './controllers/game-selection.controller'
import { GameEntity } from './entities/game.entity'
import { GameSelectionService } from './game-selection.service'
import { GameResolver } from './game.resolver'
import { GameService } from './games.service'

@Module({
    imports: [TypeOrmModule.forFeature([GameEntity]), UsersModule, AuthModule],
    providers: [GameService, GameResolver, GameSelectionService],
    controllers: [GameSelectionController],
})
export class GameModule {}
