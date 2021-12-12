/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PlayersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isValidApp =
      req.headers['dg-app-id-store']?.length > 0 &&
      req.headers['dg-content-disposition']?.length === 13 && 
      req.headers['dg-content-disposition-target']?.length === 5;
    if (isValidApp) {
      req.body.gameInfos = `GAM-${req.headers['dg-content-disposition']}-${req.headers['dg-content-disposition-target']}`;
      next();
    }
    else {
      return res.status(401).json({
        message: 'Not authorized app!',
        code: 401,
        data: null,
      });
    }
  }
}
