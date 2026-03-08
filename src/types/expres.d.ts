import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        companyId: string;
        username?: string;
        companyName?: string;
      };
    }
  }
}

export {};