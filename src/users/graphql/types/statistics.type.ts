import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class StatisticsType {
    @Field(() => String, { nullable: true })
    id: string

    @Field(() => Number, { nullable: true })
    score: number

    @Field(() => Number, { nullable: true })
    totalGames: number

    @Field(() => Number, { nullable: true })
    wins: number

    @Field(() => Number, { nullable: true })
    confirms: number

    @Field(() => Number, { nullable: true })
    updateAt: number

    @Field(() => Number, { nullable: true })
    serverPublic?: string

    @Field(() => Number, { nullable: true })
    serverSign?: string
}
