import { Query, Resolver } from '@nestjs/graphql'

import { UserType } from './graphql/types/user.type'
import { UsersService } from './users.service'

@Resolver()
export class UserResolver {
    constructor(private readonly _usersService: UsersService) {}

    @Query(() => UserType)
    async user(): Promise<UserType> {
        const user = await this._usersService.getUser()
        return user || new UserType()
    }
}
