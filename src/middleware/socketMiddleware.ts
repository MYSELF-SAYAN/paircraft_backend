import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: string;
  email: string;
}

interface AuthSocket extends Socket {
  user?: DecodedUser;
}

export const socketAuth = (socket: AuthSocket, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  jwt.verify(token, process.env.JWT_SECRET as string, {}, (err: any, decoded: any) => {
    if (err || !decoded || typeof decoded === 'string') {
      return next(new Error("Authentication error: Invalid token"));
    }

    socket.user = decoded as DecodedUser;
    next();
  });
};
