
declare global {
  namespace Express {
    interface User {
      _id: string;
      isMember: boolean;
    }
  }
}

declare module "express-session" {
  interface Session {
    messages?: string[];
  }
}

export {};