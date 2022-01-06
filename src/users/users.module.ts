import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StatisticsEntity } from './entities/statistics.entity'
import { UserEntity } from './entities/user.entity'
import { UserResolver } from './user.resolver'
import { UsersService } from './users.service'

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, StatisticsEntity])],
    providers: [UsersService, UserResolver],
    exports: [UsersService],
})
export class UsersModule {}
