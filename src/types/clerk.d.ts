import '@clerk/clerk-sdk-node';

declare module '@clerk/clerk-sdk-node' {
  interface RequestWithAuth extends Express.Request {
    auth: {
      userId: string;
      sessionId: string;
      session: unknown;
    }
  }
}

export type ClerkRequest = import('@clerk/clerk-sdk-node').RequestWithAuth;