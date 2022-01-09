import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersModule } from 'src/users/users.module'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { RefreshTokenEntity } from './entities/refresh-token.entity'
import { JwtAuthService } from './jwt.auth.service'

@Module({
    imports: [TypeOrmModule.forFeature([RefreshTokenEntity]), UsersModule],
    providers: [AuthService, AuthResolver, JwtAuthService],
    exports: [JwtAuthService],
})
export class AuthModule {}
