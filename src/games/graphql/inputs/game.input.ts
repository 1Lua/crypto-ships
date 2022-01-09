import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class GameInput {
    @Field(() => String)
    id: string
}
