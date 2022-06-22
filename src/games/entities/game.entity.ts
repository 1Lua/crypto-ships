import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export const GAME_TABLE_NAME = 'games'

@Entity(GAME_TABLE_NAME)
export class GameEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'uuid', nullable: false })
    user1: string

    @Column({ type: 'uuid', nullable: false })
    user2: string

    @Column({ type: Number, nullable: false })
    status: number

    @Column({ type: String, nullable: true })
    hash1: string

    @Column({ type: String, nullable: true })
    hash2: string

    @Column({ type: String, nullable: true })
    placement1: string

    @Column({ type: String, nullable: true })
    placement2: string

    @Column({ type: String, nullable: true })
    salt1: string

    @Column({ type: String, nullable: true })
    salt2: string

    @Column({ type: String, nullable: true })
    result1: string

    @Column({ type: String, nullable: true })
    result2: string

    @Column({ type: String, nullable: true })
    history: string

    @Column({ type: 'uuid', nullable: true })
    winner: string

    @Column({ type: 'bigint', nullable: true })
    createdAt: number

    @Column({ type: 'bigint', nullable: true })
    finishedAt: number

    @Column({ type: String, nullable: true })
    serverPublic: string

    @Column({ type: String, nullable: true })
    serverSign: string
}
