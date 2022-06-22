import { Args, Query, Resolver } from '@nestjs/graphql'

import { GameInput } from './graphql/inputs/game.input'
import { LastGamesInput } from './graphql/inputs/last-games.input'
import { UserGamesInput } from './graphql/inputs/user-games.input'
import { GameType } from './graphql/types/game.type'
import { GameService } from './services/games.service'

@Resolver()
export class GameResolver {
    constructor(private readonly _gamesService: GameService) {}

    @Query(() => GameType)
    async game(@Args('input') input: GameInput): Promise<GameType | undefined> {
        return await this._gamesService.getGame(input.id)
    }

    @Query(() => [GameType])
    async getLastGames(
        @Args('input') input: LastGamesInput,
    ): Promise<GameType[]> {
        return await this._gamesService.getLastGames(
            input.count,
            input.from,
            input.time,
        )
    }

    @Query(() => [GameType])
    async getUserGames(
        @Args('input') input: UserGamesInput,
    ): Promise<GameType[]> {
        return await this._gamesService.getUserGames(
            input.userId,
            input.count,
            input.from,
            input.time,
        )
    }
}
