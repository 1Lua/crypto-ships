import { Injectable } from '@nestjs/common'

import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UserEntity } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'

import { AuthDataDto } from './dtos/auth-data.dto'
import { LoginDto } from './dtos/login.dto'

@Injectable()
export class AuthService {
    constructor(private readonly _usersService: UsersService) {}

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

        const authData: AuthDataDto = {
            token: 'ok',
            refreshToken: 'ok',
            expiresAt: 10,
        }
        return authData
    }
}
