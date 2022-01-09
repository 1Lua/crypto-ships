import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from 'src/app.module'

import { JwtAuthService } from './jwt.auth.service'

describe('JwtAuthServer', () => {
    let service: JwtAuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [JwtAuthService],
        }).compile()

        service = module.get<JwtAuthService>(JwtAuthService)
    })

    it('Creating token', async () => {
        expect(service).toBeDefined()
        const token = await service.createJWT({ sub: '1234' })

        const verifyData = await service.decodeJWT(token.token)
        console.log(verifyData)
    })
})
