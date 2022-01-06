import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { UserType } from 'src/users/graphql/types/user.type'

import { AuthService } from './auth.service'
import { CreateUserInput } from './graphql/inputs/create-user.input'
import { LoginInput } from './graphql/inputs/login.input'
import { AuthType } from './graphql/types/auth.type'

@Resolver()
export class AuthResolver {
    constructor(private readonly _authService: AuthService) {}

    @Mutation(() => UserType)
    async signUp(@Args('input') input: CreateUserInput): Promise<UserType> {
        return await this._authService.signUp(input)
    }

    @Mutation(() => AuthType)
    async signIn(@Args('input') input: LoginInput): Promise<AuthType> {
        return await this._authService.signIn(input)
    }

    @Mutation(() => AuthType)
    async updateRefreshToken(): Promise<AuthType> {
        return new AuthType()
    }
}
