import { CanActivate, Injectable } from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(): Promise<boolean> {
        return true
    }
}
