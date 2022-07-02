import { Args, Query, Resolver } from '@nestjs/graphql'

import { UserByIdInput } from './graphql/inputs/user-by-id.input'
import { UserInput } from './graphql/inputs/user.input'
import { UserType } from './graphql/types/user.type'
import { UsersService } from './users.service'

@Resolver()
export class UserResolver {
    constructor(private readonly _usersService: UsersService) {}

    @Query(() => UserType)
    async user(@Args('input') input: UserInput): Promise<UserType> {
        const user = await this._usersService.getUserByNameWithStatistics(
            input.name,
        )
        return user || new UserType()
    }

    @Query(() => UserType)
    async userById(
        @Args('input') input: UserByIdInput,
    ): Promise<UserType | undefined> {
        const user = await this._usersService.getUserByIdWithStatistics(
            input.id,
        )
        return user || new UserType()
    }
}
