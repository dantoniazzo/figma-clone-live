import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { LiveblocksProvider } from '@liveblocks/react/suspense';
import { env } from 'app/config';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

// Import your Publishable Key
const PUBLISHABLE_KEY = env.clerk.publishableKey;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <LiveblocksProvider
        publicApiKey={env.liveblocks.publicApiKey}
        throttle={16}
      >
        <App />
      </LiveblocksProvider>
    </ClerkProvider>
  </StrictMode>
);
