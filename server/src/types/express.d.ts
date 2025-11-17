import { Request, Response } from 'express';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface AuthRequest extends Request {
  user?: IUser;
  body: any;
  params: any;
  query: any;
}

export interface AuthResponse extends Response {}
