import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ResponseMapper } from './common/response-mapper.interceptor';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GitlabModule } from './gitlab/gitlab.module';
import { OperationModule } from './operation/operation.module';
import { ScoringModule } from './scoring/scoring.module';
import { GroupModule } from './group/group.module';
import { SysinfoModule } from './sysinfo/sysinfo.module';
import { GithubModule } from './github/github.module';
import { TokenController } from './token/token.controller';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    GitlabModule,
    OperationModule,
    ScheduleModule.forRoot(),
    ScoringModule,
    GroupModule,
    SysinfoModule,
    GithubModule,
  ],
  controllers: [AppController, TokenController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMapper,
    },
  ],
})
export class AppModule {}
