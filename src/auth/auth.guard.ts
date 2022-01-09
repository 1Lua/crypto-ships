import { CanActivate, Injectable } from '@nestjs/common'

//import { JwtAuthService } from './jwt.auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
    /*constructor (
        private readonly _jwtAuthService: JwtAuthService
    ) {} */

    async canActivate(): Promise<boolean> {
        return true
    }
}
