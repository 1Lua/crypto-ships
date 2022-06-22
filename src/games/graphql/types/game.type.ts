import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class GameType {
    @Field(() => String, { nullable: false })
    id: string

    @Field(() => String, { nullable: true })
    user1: string

    @Field(() => String, { nullable: true })
    user2: string

    @Field(() => String, { nullable: true })
    status: number

    @Field(() => String, { nullable: true })
    hash1?: string

    @Field(() => String, { nullable: true })
    hash2?: string

    @Field(() => String, { nullable: true })
    placement1?: string

    @Field(() => String, { nullable: true })
    placement2?: string

    @Field(() => String, { nullable: true })
    salt1?: string

    @Field(() => String, { nullable: true })
    salt2?: string

    @Field(() => String, { nullable: true })
    history?: string

    @Field(() => String, { nullable: true })
    winner?: string

    @Field(() => Number, { nullable: true })
    createdAt?: number

    @Field(() => Number, { nullable: true })
    finishedAt?: number

    @Field(() => String, { nullable: true })
    serverPublic?: string

    @Field(() => Number, { nullable: true })
    serverSign?: string
}
