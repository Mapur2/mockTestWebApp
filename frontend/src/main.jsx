import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CreatePage from './pages/CreatePage.jsx'
import TestPage from './pages/TestPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ResultsDashboard from './pages/ResultsDashboard.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TestProvider } from './context/TestContext.jsx'

const router = createBrowserRouter([
  { path: '/', element: <CreatePage /> },
  { path: '/test/:testId', element: <TestPage /> },
  { path: '/results/:testId', element: <ResultsPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/my/results', element: <ResultsDashboard /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TestProvider>
        <RouterProvider router={router} />
      </TestProvider>
    </AuthProvider>
  </StrictMode>,
)
