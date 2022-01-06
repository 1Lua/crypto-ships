import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class LoginInput {
    @Field(() => String)
    login: string

    @Field(() => String)
    password: string
}
