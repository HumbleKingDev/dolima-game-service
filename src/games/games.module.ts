import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GamesController } from './games.controller';
import { Games, GamesSchema } from './games.entity';
import { GamesService } from './games.service';
import { Gift, GiftSchema } from './gift.entity';

@Module({
  controllers: [GamesController],
  providers: [GamesService],
  imports: [
    MongooseModule.forFeature([{ name: Games.name, schema: GamesSchema }]),
    MongooseModule.forFeature([{ name: Gift.name, schema: GiftSchema }]),
  ],
  exports: [GamesService],
})
export class GamesModule {}
