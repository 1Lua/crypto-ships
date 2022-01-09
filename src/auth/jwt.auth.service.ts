import { randomBytes } from 'crypto'
import * as fs from 'fs'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
    Algorithm,
    decode,
    JwtPayload,
    sign,
    SignOptions,
    verify,
} from 'jsonwebtoken'
import { v4 as Uuidv4 } from 'uuid'

const DEFAULT_TOKEN_TTL = 3600
const DEFAULT_REFRESH_TOKEN_LENGTH = 64
const DEFAULT_REFRESH_TOKEN_TTL = 3600

export type Token = {
    token: string
    expiresIn: number
    type: string
}

export type RefreshToken = {
    token: string
    expiresIn: number
}

export { JwtPayload }

/**
 * 1. Installation
 *
 * npm i --save jsonwebtoken
 * npm i --save-dev @types/jsonwebtoken
 * npm i --save-dev @types/uuid
 *
 * 2. Add Configure Params
 *
 * TOKEN_TTL=3600 # TimeToLife in seconds
 * ALGORITHM=RS256
 * TOKEN_TYPE=Bearer
 * REFRESH_TOKEN_LENGTH=64
 * REFRESH_TOKEN_TTL=3600
 *
 * 3. Create Public and Private Keys in /assets folder
 *
 * ssh-keygen -t rsa -b 4096 -m PEM -f private.key
 * openssl rsa -in private.key -pubout -outform PEM -out public.key
 */

@Injectable()
export class JwtAuthService {
    private readonly _tokenTTL: number
    private readonly _jwtOption: SignOptions
    private readonly _alg: Algorithm
    private readonly _tokenType: string
    private readonly _refreshTokenLength: number
    private readonly _refreshTokenTTL: number
    private readonly _jwtPrivateKey
    private readonly _jwtPublicKey

    constructor(private readonly _configService: ConfigService) {
        this._tokenTTL = this._configService.get<number>(
            'TOKEN_TTL',
            DEFAULT_TOKEN_TTL,
        )
        this._alg = this._configService.get<Algorithm>('ALGORITHM', 'RS256')
        this._tokenType = this._configService.get<string>(
            'TOKEN_TYPE',
            'Bearer',
        )
        this._refreshTokenLength = this._configService.get<number>(
            'REFRESH_TOKEN_LENGTH',
            DEFAULT_REFRESH_TOKEN_LENGTH,
        )
        this._refreshTokenTTL = this._configService.get<number>(
            'REFRESH_TOKEN_TTL',
            DEFAULT_REFRESH_TOKEN_TTL,
        )

        this._jwtOption = {
            algorithm: this._alg,
            expiresIn: Number(this._tokenTTL),
            keyid: 'main',
        }

        this._jwtPrivateKey = fs.readFileSync(
            `${process.cwd()}/assets/private.key`,
        )
        this._jwtPublicKey = fs.readFileSync(
            `${process.cwd()}/assets/public.key`,
        )
    }

    async createJWT(jwtPayload: JwtPayload): Promise<Token> {
        const options = this._jwtOption
        options.jwtid = Uuidv4()
        const token = sign(jwtPayload, this._jwtPrivateKey, options)
        return {
            token,
            expiresIn: this._tokenTTL,
            type: this._tokenType,
        } as Token
    }

    async decodeJWT(token: string): Promise<JwtPayload> {
        try {
            verify(token, this._jwtPublicKey, { algorithms: [this._alg] })
        } catch (err) {
            throw new Error('Token didnt verified')
        }

        const parsedToken = decode(token, { json: true })

        if (parsedToken == null) {
            throw new Error('Token didnt parsed')
        }

        return parsedToken
    }

    async createRefreshToken(): Promise<RefreshToken> {
        const refreshToken = randomBytes(
            Number(this._refreshTokenLength),
        ).toString('hex')
        return {
            token: refreshToken,
            expiresIn: this._refreshTokenTTL,
        } as RefreshToken
    }
}
