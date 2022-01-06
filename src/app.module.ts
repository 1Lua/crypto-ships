import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { config } from './config/config'
import { typeOrmConfig } from './config/typeorm.config'
import { UsersModule } from './users/users.module'

@Module({
    imports: [
        ConfigModule.forRoot(config),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        GraphQLModule.forRoot({
            playground: true,
            autoSchemaFile: 'schema.gql',
            introspection: true,
            installSubscriptionHandlers: true,
        }),
        UsersModule,
        AuthModule,
    ],
})
export class AppModule {}
