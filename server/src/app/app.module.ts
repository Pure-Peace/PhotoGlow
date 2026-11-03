import { join } from 'path'

import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MulterModule } from '@nestjs/platform-express'
import { ScheduleModule } from '@nestjs/schedule'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import type { ApolloDriverConfig } from '@nestjs/apollo'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'

// App
import { AppController } from '@/app/app.controller'
import { AppResolver } from '@/app/app.resolver'
import { AppService } from '@/app/app.service'

import { jwtKeys } from '@photoglow/shared/env'
import { AuthModule } from '@/modules/auth/auth.module'
import { ChatModule } from '@/modules/chat/chat.module'
import { CommentsModule } from '@/modules/comments/comments.module'
import { InteractionsModule } from '@/modules/interactions/interactions.module'
import { MediaModule } from '@/modules/media/media.module'
import { GlobalModule } from '@/infra/global/global.module'
import { ModerationModule } from '@/modules/moderation/moderation.module'
import { MentionsModule } from '@/modules/mentions/mentions.module'
import { PostsModule } from '@/modules/posts/posts.module'
import { RelationshipsModule } from '@/modules/relatitonships/relationships.module'
import { NotificationsModule } from '@/modules/notifications/notifications.module'
import { SettingsModule } from '@/modules/settings/settings.module'
import { TopicsModule } from '@/modules/topics/topics.module'
import { UserModule } from '@/modules/user/user.module'
import { SearchModule } from '@/modules/search/search.module'
import { jwtDefault } from '@photoglow/shared/env'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env[jwtKeys.secret] || jwtDefault.secret,
    }),
    MulterModule.register({
      dest: '.upload_cache',
    }),
    GlobalModule,
    // Controller Modules
    AuthModule,
    ChatModule,
    CommentsModule,
    InteractionsModule,
    MediaModule,
    MentionsModule,
    ModerationModule,
    NotificationsModule,
    PostsModule,
    RelationshipsModule,
    SearchModule,
    SettingsModule,
    TopicsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
