import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersModule } from 'src/users/users.module'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { RefreshTokenEntity } from './entities/refresh-token.entity'

@Module({
    imports: [TypeOrmModule.forFeature([RefreshTokenEntity]), UsersModule],
    providers: [AuthService, AuthResolver],
})
export class AuthModule {}
