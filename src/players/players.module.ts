import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GamesModule } from '../games/games.module';
import { PlayersMiddleware } from '../middlewares/Players.middleware';
import { PlayersController } from './players.controller';
import { Players, PlayersSchema } from './players.entity';
import { PlayersService } from './players.service';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService],
  imports: [
    MongooseModule.forFeature([{ name: Players.name, schema: PlayersSchema }]),
    GamesModule,
  ],
})
export class PlayersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlayersMiddleware).forRoutes('players');
  }
}
