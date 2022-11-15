import * as express from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface IAuth {
  user_id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
