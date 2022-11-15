import { NextFunction, Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { parameter } from '../utils/parameter.util';
import { errorMessage } from '../utils/message.util';
import { BadRequestError } from '../exceptions/BadRequest.exception';

export const validateBody = (schema: { new (): any }) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const target = plainToClass(schema, req.body);

    try {
      await validateOrReject(target);

      next();
    } catch (err: any) {
      next(new BadRequestError(errorMessage.invalidParameter(`${err[0].property}`)));
    }
  };
};
