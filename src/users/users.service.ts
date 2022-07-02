import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'
import { Repository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto'
import { StatisticsEntity } from './entities/statistics.entity'
import { UserEntity } from './entities/user.entity'

export const MIN_PASSWORD_LENGTH = 6

export const emptyStatistics = {
    score: 0,
    totalGames: 0,
    wins: 0,
    confirms: 0,
} as StatisticsEntity

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly _userRepository: Repository<UserEntity>,
        @InjectRepository(StatisticsEntity)
        private readonly _statisticsRepository: Repository<StatisticsEntity>,
    ) {}

    async hashPassword(password: string): Promise<string> {
        const ROUND = 12
        const salt = await bcrypt.genSalt(ROUND)
        const hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword
    }

    async comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword)
    }

    async getUser(id: string): Promise<UserEntity | undefined> {
        return await this._userRepository.findOne(id)
    }

    async getUserByName(name: string): Promise<UserEntity | undefined> {
        return await this._userRepository.findOne({ name })
    }

    async getUserByLogin(login: string): Promise<UserEntity | undefined> {
        return await this._userRepository.findOne({ login })
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        if (!createUserDto.login.length) {
            throw new Error('Empty login')
        }

        if (!createUserDto.name.length) {
            throw new Error('Empty name')
        }

        if (createUserDto.password.length < MIN_PASSWORD_LENGTH) {
            throw new Error(
                `Password must contain at least ${MIN_PASSWORD_LENGTH} symbols`,
            )
        }

        if (await this.getUserByName(createUserDto.name)) {
            throw new Error('Name is already used')
        }

        if (await this.getUserByLogin(createUserDto.login)) {
            throw new Error('Login is already used')
        }

        const user = this._userRepository.create(createUserDto)
        user.createdAt = Date.now()
        user.password = await this.hashPassword(user.password)
        await this._userRepository.save(user)

        const statistics = this._statisticsRepository.create(emptyStatistics)
        statistics.updateAt = Date.now()
        statistics.user = user

        await this._statisticsRepository.save(statistics)

        user.statistics = statistics
        return user
    }

    async getUserByIdWithStatistics(id: string): Promise<UserEntity> {
        const user = await this._userRepository.findOne(
            { id },
            { relations: ['statistics'] },
        )
        if (!user) {
            throw new Error()
        }
        return user
    }

    async getUserByNameWithStatistics(name: string): Promise<UserEntity> {
        const user = await this._userRepository.findOne(
            { name },
            { relations: ['statistics'] },
        )
        if (!user) {
            throw new Error()
        }
        return user
    }
}
