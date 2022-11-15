import { NextFunction, Request, Response } from 'express';
import { InternalServerError } from '../exceptions/InternalServer.exception';
import { logger } from '../utils/logger.util';

/** error logging 및 response 전달 */
export const errorInterceptor = (err: any, req: Request, res: Response, next: NextFunction): Response => {
  if (err) {
    const request = { user_id: req?.user?.user_id || null, params: req.params, query: req.query, body: req.body };

    // custom error warn 처리
    if (['Bad Request', 'Forbidden', 'Not Found', 'Bad Gateway', 'Unauthorized'].includes(err.name)) {
      logger.warn(`--------------- Warn ---------------`);
      logger.warn(`Method: ${req.method}`);
      logger.warn(`URL: ${req.originalUrl}`);
      logger.warn(`Request: ${JSON.stringify(request)}`);
      logger.warn(`Error: ${err}`);
      logger.warn('-------------------------------------');
    } else {
      logger.error(`--------------- Error ---------------`);
      logger.error(`Method: ${req.method}`);
      logger.error(`URL: ${req.originalUrl}`);
      logger.error(`Request: ${JSON.stringify(request)}`);
      logger.error(`Error: ${err}`);
      logger.error('-------------------------------------');

      err = new InternalServerError('서버 점검 중입니다.');
    }
  }

  return res.status(err.status).json({
    name: err.name,
    message: err.message,
  });
};
