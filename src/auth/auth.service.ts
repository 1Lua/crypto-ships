import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UserEntity } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'

import { AuthDataDto } from './dtos/auth-data.dto'
import { LoginDto } from './dtos/login.dto'
import { RefreshTokenEntity } from './entities/refresh-token.entity'
import {
    JwtAuthService,
    Token,
    RefreshToken,
    JwtPayload,
} from './jwt.auth.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly _usersService: UsersService,
        private readonly _jwtAuthService: JwtAuthService,
        @InjectRepository(RefreshTokenEntity)
        private readonly _refreshTokenRepository: Repository<RefreshTokenEntity>,
    ) {}

    async signUp(createUserDro: CreateUserDto): Promise<UserEntity> {
        const user = await this._usersService.createUser(createUserDro)
        return user
    }

    async signIn(loginDto: LoginDto): Promise<AuthDataDto> {
        const user = await this._usersService.getUserByLogin(loginDto.login)
        if (!user) {
            throw new Error('Invalid login data')
        }

        const compare = await this._usersService.comparePassword(
            loginDto.password,
            user.password,
        )
        if (!compare) {
            throw new Error('Invalid login data')
        }

        const payload: JwtPayload = {
            sub: user.id,
        }

        const token: Token = await this._jwtAuthService.createJWT(payload)
        const refreshToken: RefreshToken =
            await this._jwtAuthService.createRefreshToken()

        const MSINSEC = 1000

        const refTok = this._refreshTokenRepository.create({
            token: refreshToken.token,
            expiresAt: Date.now() + refreshToken.expiresIn * MSINSEC,
        })
        this._refreshTokenRepository.save(refTok)

        const authData: AuthDataDto = {
            token: token.token,
            refreshToken: refreshToken.token,
            expiresAt: Date.now() + token.expiresIn * MSINSEC,
            userId: user.id,
            userName: user.name,
        }
        return authData
    }
}
