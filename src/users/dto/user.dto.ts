import { StatisticsDto } from './statistics.dto'

export interface UserDto {
    id: string
    name: string
    login: string
    password: string
    createdAt: number
}

export interface UserWithStatisticsDto extends UserDto {
    statistics: StatisticsDto
}
