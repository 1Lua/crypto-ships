export interface StatisticsDto {
    id: string
    score: number
    totalGames: number
    wins: number
    confirms: number
    updateAt: number
    serverPublic?: string
    serverSign?: string
}
