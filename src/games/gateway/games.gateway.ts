import { Logger } from '@nestjs/common'
import {
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets'

import { GameLogicService } from '../services/game-logic.service'

import {
    ClientToServerEventsParameters,
    Server,
    Socket,
} from './games/magic-of-gateway'

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    transports: ['polling'],
})
export class GamesGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly _gameClientService: GameLogicService) {}

    @WebSocketServer()
    server: Server

    private _logger: Logger = new Logger('AppGateway')

    @SubscribeMessage('userAuth')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() ...args: ClientToServerEventsParameters<'userAuth'>
    ): Promise<void> {
        const { token } = args[0]
        try {
            await this._gameClientService.authUser(token, client)
        } catch (err) {
            this._logger.error('UserAuth', err)
        }
    }

    @SubscribeMessage('connectToGame')
    async connectToGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() ...args: ClientToServerEventsParameters<'connectToGame'>
    ): Promise<void> {
        const { id } = args[0]
        try {
            await this._gameClientService.connectToGame(id, client)
        } catch (err) {
            this._logger.error('connectToGame', err)
        }
    }

    @SubscribeMessage('userReady')
    async userReady(
        @ConnectedSocket() client: Socket,
        @MessageBody() ...args: ClientToServerEventsParameters<'userReady'>
    ): Promise<void> {
        const { ready, gameId } = args[0]
        try {
            await this._gameClientService.onUserReady(gameId, ready, client)
        } catch (err) {
            this._logger.error('userReady', err)
        }
    }

    @SubscribeMessage('setUserHash')
    async setUserHash(
        @ConnectedSocket() client: Socket,
        @MessageBody() ...args: ClientToServerEventsParameters<'setUserHash'>
    ): Promise<void> {
        const { hash, gameId } = args[0]
        try {
            await this._gameClientService.onSetUserHash(gameId, hash, client)
        } catch (err) {
            this._logger.error('setUserHash', err)
        }
    }

    afterInit(server: Server): void {
        this._logger.log(`Initialized ${server.local}`)
    }

    handleDisconnect(client: Socket): void {
        this._logger.log(`Client disconnected: ${client.id}`)
    }

    handleConnection(client: Socket): void {
        this._logger.log(`Client connected: ${client.id}`)
        client.emit('waitingForAuth', {
            message: 'Server is waiting token from you',
        })
    }
}
