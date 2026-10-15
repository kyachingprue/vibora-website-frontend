import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { store } from '@/store'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <HelmetProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={10}
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '14px',
                  background: '#171717',
                  color: '#fff',
                  padding: '14px 18px'
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff'
                  }
                }
              }}
            />
          </BrowserRouter>
        </HelmetProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>
)
