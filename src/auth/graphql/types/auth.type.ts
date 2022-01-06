import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AuthType {
    @Field(() => String)
    token: string

    @Field(() => Number)
    expiresAt: number

    @Field(() => String)
    refreshToken: string
}
