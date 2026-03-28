import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './config/apollo.js'
import { AppProvider } from './context/AppContext.jsx'
import App from './App.jsx'

// Extract JWT token from URL after Google Auth redirect
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
if (token) {
  localStorage.setItem('token', token);
  window.history.replaceState({}, document.title, window.location.pathname);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AppProvider>
        <App />
      </AppProvider>
    </ApolloProvider>
  </StrictMode>,
)
