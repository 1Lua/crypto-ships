import { Field, InputType } from '@nestjs/graphql'

const DEFAULT_COUNT = 40

@InputType()
export class UserGamesInput {
    @Field(() => String, { nullable: false })
    userId: string

    @Field(() => Number, { nullable: true, defaultValue: DEFAULT_COUNT })
    count: number

    @Field(() => Number, { nullable: true, defaultValue: 0 })
    from: number

    @Field(() => Number, { nullable: true })
    time?: number
}
