import type { Clerk } from '@clerk/clerk-react';

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}