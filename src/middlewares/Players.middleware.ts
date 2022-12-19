/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PlayersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isValidApp =
      req.headers['dg-v2-2022-app-id-store']?.length > 0 &&
      req.headers['dg-v2-2022-content-disposition']?.length === 13 && 
      req.headers['dg-v2-2022-content-disposition-target']?.length === 5;
    if (isValidApp) {
      req.body.gameInfos = `GAM-${req.headers['dg-v2-2022-content-disposition']}-${req.headers['dg-v2-2022-content-disposition-target']}`;
      next();
    }
    else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: '',
        code: HttpStatus.UNAUTHORIZED,
        data: null,
      });
    }
  }
}
