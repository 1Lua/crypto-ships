import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class StatisticsType {
    @Field(() => String)
    id: string

    @Field(() => Number)
    score: number

    @Field(() => Number)
    totalGames: number

    @Field(() => Number)
    wins: number

    @Field(() => Number)
    confirms: number

    @Field(() => Number)
    updateAt: number

    @Field(() => Number)
    serverPublic: string | undefined

    @Field(() => Number)
    serverSign: string | undefined
}
