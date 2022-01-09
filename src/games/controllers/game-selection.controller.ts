import { Controller, Delete, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import { JwtAuthService } from 'src/auth/jwt.auth.service'

import { GameSelectionService } from '../game-selection.service'

@Controller('joingame')
export class GameSelectionController {
    constructor(
        private readonly _gameSelectionService: GameSelectionService,
        private readonly _jwtAuthService: JwtAuthService,
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
        this._gameSelectionService.removeUserFromQuery({ id: userId }) // избежание дублирования
        this._gameSelectionService.removeSubsciber({ id: userId })

        this._gameSelectionService.addSubscriber({ id: userId }, res)
        this._gameSelectionService.addUserToQuery({ id: userId })
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

        this._gameSelectionService.removeUserFromQuery({ id: userId })
        this._gameSelectionService.removeSubsciber({ id: userId })

        return 'ok'
    }
}
