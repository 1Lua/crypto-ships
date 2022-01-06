import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'

import { UserEntity } from './user.entity'

export const STATISTICS_TABLE_NAME = 'statistics'

@Entity(STATISTICS_TABLE_NAME)
export class StatisticsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: Number })
    score: number

    @Column({ type: Number })
    totalGames: number

    @Column({ type: Number })
    wins: number

    @Column({ type: Number })
    confirms: number

    @Column({ type: 'bigint' })
    updateAt: number

    @Column({ type: String, nullable: true })
    serverPublic: string | undefined

    @Column({ type: String, nullable: true })
    serverSign: string | undefined

    @OneToOne(() => UserEntity, (user) => user.statistics, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    user: UserEntity
}
