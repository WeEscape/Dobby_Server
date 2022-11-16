import { Request } from 'express';
import { logger } from '../utils/logger.util';

/** local, development 시 response logging */
export const responseInterceptor = (req: Request, result?: unknown): unknown => {
  const request = { user_id: req?.user?.user_id || null, params: req.params, query: req.query, body: req.body };
  const response = result ?? null;

  logger.http(`--------------- Response ---------------`);
  logger.http(`Method: ${req.method}`);
  logger.http(`URL: ${req.originalUrl}`);
  logger.http(`Request: ${JSON.stringify(request)}`);
  logger.http(`Response: ${JSON.stringify(response)}`);
  logger.http('----------------------------------------');

  return { data: result };
};
