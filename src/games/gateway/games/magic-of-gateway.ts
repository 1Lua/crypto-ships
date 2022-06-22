import { ArgumentsHost, Catch, Logger } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'
import * as SocketIO from 'socket.io'

import { ClientToServerEvents } from './client-to-server'
import { InterServerEvents } from './inter-server-events'
import { ServerToClientEvents, ServerToClientErrors } from './server-to-clients'
import { SocketData } from './socket-data'

/**
 * Magic Server
 */
export type Server = SocketIO.Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>

/**
 * Magic Socket
 */
export type Socket = SocketIO.Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>

export type ClientToServerEventsNames = `${string & keyof ClientToServerEvents}`
export type ClientToServerEventsParameters<
    T extends ClientToServerEventsNames,
> = Parameters<ClientToServerEvents[T]>
export type ServerToClientEventsNames = `${string & keyof ServerToClientEvents}`
export type ServerToClientEventsParameters<
    T extends ServerToClientEventsNames,
> = Parameters<ServerToClientEvents[T]>
export type ServerToClientErrorsNames = `${string & keyof ServerToClientErrors}`
export type ServerToClientErrorsParameters<
    T extends ServerToClientErrorsNames,
> = Parameters<ServerToClientEvents[T]>

export type GamesGatewayErrors<T extends ServerToClientErrorsNames> =
    ServerToClientErrorsParameters<T>[0]['message']
export class GamesGatewayError<
    T extends ServerToClientErrorsNames,
> extends WsException {
    name: T
    constructor(name: T, message: GamesGatewayErrors<T>) {
        super(message)
        this.name = name
    }
}

@Catch(GamesGatewayError)
export class GamesGatewayFilter extends BaseWsExceptionFilter {
    private _logger: Logger = new Logger('AppGatewayFilter')

    catch<T extends ServerToClientErrorsNames>(
        exception: GamesGatewayError<T>,
        host: ArgumentsHost,
    ): void {
        const ctx = host.switchToWs()
        const client: SocketIO.Socket = ctx.getClient()
        client.emit(exception.name, { message: exception.message })
        this._logger.error(exception.message, exception.stack)
        super.catch(exception, host)
    }
}
