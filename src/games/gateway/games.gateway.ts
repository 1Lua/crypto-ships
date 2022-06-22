import { Logger, UseFilters } from '@nestjs/common'
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
    GamesGatewayFilter,
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

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('userAuth')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() args: ClientToServerEventsParameters<'userAuth'>[0],
    ): Promise<void> {
        const { token } = args
        await this._gameClientService.authUser(token, client)
    }

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('connectToGame')
    async connectToGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() args: ClientToServerEventsParameters<'connectToGame'>[0],
    ): Promise<void> {
        const { id } = args
        await this._gameClientService.connectToGame(id, client)
    }

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('userReady')
    async userReady(
        @ConnectedSocket() client: Socket,
        @MessageBody() args: ClientToServerEventsParameters<'userReady'>[0],
    ): Promise<void> {
        const { ready, gameId } = args
        await this._gameClientService.onUserReady(gameId, ready, client)
    }

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('setUserHash')
    async setUserHash(
        @ConnectedSocket() client: Socket,
        @MessageBody() args: ClientToServerEventsParameters<'setUserHash'>[0],
    ): Promise<void> {
        const { hash, gameId } = args
        await this._gameClientService.onSetUserHash(gameId, hash, client)
    }

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('setUserPlacement')
    async setUserPlacement(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        args: ClientToServerEventsParameters<'setUserPlacement'>[0],
    ): Promise<void> {
        const { placement, gameId } = args
        await this._gameClientService.setUserPlacement(
            gameId,
            placement,
            client,
        )
    }

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('userMakeMove')
    async userMakeMove(
        @ConnectedSocket() client: Socket,
        @MessageBody() args: ClientToServerEventsParameters<'userMakeMove'>[0],
    ): Promise<void> {
        const { x, y, gameId } = args
        await this._gameClientService.onUserMakeMove(gameId, x, y, client)
    }

    @UseFilters(GamesGatewayFilter)
    @SubscribeMessage('userMoveResult')
    async userMoveResult(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        args: ClientToServerEventsParameters<'userMoveResult'>[0],
    ): Promise<void> {
        const { x, y, hit, gameId } = args
        await this._gameClientService.onUserMoveResult(
            gameId,
            x,
            y,
            hit,
            client,
        )
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
