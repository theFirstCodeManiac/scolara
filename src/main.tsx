import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { HubProvider } from './context/HubContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <HubProvider>
        <App />
      </HubProvider>
    </AuthProvider>
  </StrictMode>,
);
