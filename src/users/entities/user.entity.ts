import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { StatisticsEntity } from './statistics.entity'

export const USER_TABLE_NAME = 'users'

@Entity(USER_TABLE_NAME)
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: String })
    name: string

    @Column({ type: String })
    login: string

    @Column({ type: String })
    password: string

    @OneToOne(() => StatisticsEntity, (statistics) => statistics.user)
    statistics: StatisticsEntity

    @Column({ type: 'bigint' })
    createdAt: number
}
