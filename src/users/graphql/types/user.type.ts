import { Field, ObjectType } from '@nestjs/graphql'

import { StatisticsType } from './statistics.type'

@ObjectType('User')
export class UserType {
    @Field(() => String)
    id: string

    @Field(() => String)
    name: string

    @Field(() => Number)
    createdAt: number

    @Field(() => StatisticsType)
    statistics: StatisticsType
}
