export interface GameDto {
    id: string
    user1: string
    user2: string
    status: number
    hash1?: string
    hash2?: string
    placement1?: string
    placement2?: string
    salt1?: string
    salt2?: string
    result1: string
    result2: string
    history?: string
    winner?: string
    createdAt: number
    startedAt?: number
    finishedAt?: number
    serverPublic?: string
    serverSign?: string
}
