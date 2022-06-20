import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { config } from './config/config'
import { typeOrmConfig } from './config/typeorm.config'
import { GameModule } from './games/games.module'
import { UsersModule } from './users/users.module'

@Module({
    imports: [
        ConfigModule.forRoot(config),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        GraphQLModule.forRoot({
            driver: ApolloDriver,
            playground: true,
            autoSchemaFile: 'schema.gql',
            introspection: true,
            installSubscriptionHandlers: true,
        }),
        UsersModule,
        AuthModule,
        GameModule,
    ],
})
export class AppModule {}
