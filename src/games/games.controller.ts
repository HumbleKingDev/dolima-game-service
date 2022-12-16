import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { InvalidCodeException } from '../exceptions/invalid-code-exception';
import { isValidGameCode } from '../helpers/games.helper';
import { NewGameDto, UpdateGameDto } from './games.dto';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private service: GamesService) {}

  // @Get()
  // async findAll() {
  //   return this.service.findAll();
  // }

  @Post()
  async create(@Body() newGame: NewGameDto) {
    return this.service.create(newGame);
  }

  // @Get(':code')
  // async findOne(@Param('code') code: string) {
  //   if (!isValidGameCode(code)) {
  //     throw new InvalidCodeException('Game code is incorrect!');
  //   }
  //   return this.service.findOne(code);
  // }

  // @Patch(':code')
  // async update(@Param('code') code: string, @Body() updateGame: UpdateGameDto) {
  //   if (!isValidGameCode(code)) {
  //     throw new InvalidCodeException('Game code is incorrect!');
  //   }
  //   return this.service.update(code, updateGame);
  // }
}
