import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  // const token: string | undefined = socket.handshake.auth.token || socket.handshake.query.token;

  // console.log('Headers:', socket.handshake.headers);
  // console.log('Auth:', socket.handshake.auth);
  // const token: string = socket.handshake.auth.token;

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const token: string | undefined = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

  if (token == null || token === '') {
    return next(new Error('Authentication error: No token provided'));
  }

  const secret = process.env.JWT_SECRET;
  if (secret == null || secret === '') {
    return next(new Error('Authentication error: JWT secret is not defined'));
  }

  try {
    const decoded = jwt.verify(token, secret);
    (socket.data as any)= decoded;
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
};