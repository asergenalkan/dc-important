import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-indigo-500 hover:bg-indigo-600 text-sm normal-case',
          socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 border border-white/10 text-sm normal-case',
          socialButtonsBlockButtonText: 'font-normal',
          formFieldInput: 'bg-white/10 border-white/10 text-white',
          formFieldLabel: 'text-gray-300',
          card: 'bg-gray-800/90 backdrop-blur-sm',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          dividerLine: 'bg-white/10',
          dividerText: 'text-gray-400',
          footer: 'hidden'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);