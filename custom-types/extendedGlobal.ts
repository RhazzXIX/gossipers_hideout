declare global {
  namespace Express {
    interface User {
      _id: string;
      password: string;
      isMember: boolean;
      isAdmin: boolean;
    }
  }
}

declare module "express-session" {
  interface Session {
    messages?: string[];
  }
}

export {};
