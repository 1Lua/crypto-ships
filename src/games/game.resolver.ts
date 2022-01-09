import { Args, Query, Resolver } from '@nestjs/graphql'

import { GameInput } from './graphql/inputs/game.input'
import { GameType } from './graphql/types/game.type'

@Resolver()
export class GameResolver {
    @Query(() => GameType)
    async game(@Args('input') input: GameInput): Promise<GameType> {
        console.log(input)
        return new GameType()
    }
}
