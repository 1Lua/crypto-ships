import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export const REFRESH_TOKENS_TABLE_NAME = 'refresh_tokens'

@Entity(REFRESH_TOKENS_TABLE_NAME)
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: String })
    token: string

    @Column({ type: 'bigint' })
    expiresAt: number
}
