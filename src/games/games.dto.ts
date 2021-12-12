/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';

import { IsValidDate } from '../helpers/date.helper';
import { GiftsValidator } from '../helpers/games.helper';

export class NewGameDto {
  @IsNotEmpty({ message: `Game's name is required.` })
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty({ message: `Maximum number of winners is required.` })
  @Type(() => Number)
  @IsNumber()
  expectedWinners: number;

  @IsNotEmpty({ message: `Start Date's value is required.` })
  @Validate(IsValidDate)
  startDate: string;

  @IsNotEmpty({ message: `End Date's value is required.` })
  @Validate(IsValidDate)
  endDate: string;

  @IsNotEmpty({ message: 'Gifts to win cannot be empty.' })
  @IsArray({
    message:
      'Gifts to win must be array of string codes and not empty',
  })
  @IsString({ each: true })
  @Validate(GiftsValidator)
  gifts: string[];
}

export class UpdateGameDto {
  @IsOptional()
  @IsNotEmpty({ message: `Game's name is required.` })
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsNotEmpty({ message: `Maximum number of winners is required.` })
  @Type(() => Number)
  @IsNumber()
  expectedWinners: number;

  @IsOptional()
  @IsNotEmpty({ message: `Start Date's value is required.` })
  @Validate(IsValidDate)
  startDate: string;

  @IsOptional()
  @IsNotEmpty({ message: `End Date's value is required.` })
  @Validate(IsValidDate)
  endDate: string;
}
