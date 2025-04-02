import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-hqyiirkk4eh32ivo.us.auth0.com"
      clientId="tmzX5QYNAFBnkDKRWaYVMWg2PHu9V4v4"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'http://localhost:3001', // ✅ Must match Auth0 API identifier
        prompt: 'login', // 🔁 Forces login every time
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
