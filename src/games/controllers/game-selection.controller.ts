import { Controller, Delete, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import { JwtAuthService } from 'src/auth/jwt.auth.service'
import { UsersService } from 'src/users/users.service'

import { GameSelectionService } from '../services/game-selection.service'

@Controller('joingame')
export class GameSelectionController {
    constructor(
        private readonly _gameSelectionService: GameSelectionService,
        private readonly _jwtAuthService: JwtAuthService,
        private readonly _usersService: UsersService,
    ) {}

    @Post()
    async join(@Req() req: Request, @Res() res: Response): Promise<void> {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        const verifyData = await this._jwtAuthService.decodeJWT(authHeader)

        if (!verifyData.sub) {
            throw new Error('Token is not consist user id')
        }
        const userId = verifyData.sub

        const user = await this._usersService.getUser(userId)
        if (user) {
            this._gameSelectionService.removeUserFromQuery(user) // избежание дублирования
            this._gameSelectionService.removeSubsciber(user)

            this._gameSelectionService.addSubscriber(user, res)
            this._gameSelectionService.addUserToQuery(user)
        }
    }

    @Delete()
    async leave(@Req() req: Request): Promise<string> {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        const verifyData = await this._jwtAuthService.decodeJWT(authHeader)

        if (!verifyData.sub) {
            throw new Error('Token is not consist user id')
        }
        const userId = verifyData.sub

        const user = await this._usersService.getUser(userId)
        if (user) {
            this._gameSelectionService.removeUserFromQuery(user)
            this._gameSelectionService.removeSubsciber(user)
            return 'ok'
        }
        return ''
    }
}
