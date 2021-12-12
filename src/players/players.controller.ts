/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';

import { ConfirmPlayingDto, PlayersDto } from './players.dto';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private service: PlayersService) {}

  // @Get()
  // async findAll() {
  //   return this.service.findAll();
  // }

  @Post()
  async create(@Body() player: PlayersDto) {
    return this.service.create(player);
  }

  @Post('/confirm')
  async confirmPlaying(@Body() player: ConfirmPlayingDto) {
    return this.service.confirmPlaying(player);
  }
}
