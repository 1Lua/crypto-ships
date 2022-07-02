import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class UserByIdInput {
    @Field(() => String)
    id: string
}
