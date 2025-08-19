import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CreatePage from './pages/CreatePage.jsx'
import TestPage from './pages/TestPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

const router = createBrowserRouter([
  { path: '/', element: <CreatePage /> },
  { path: '/test/:testId', element: <TestPage /> },
  { path: '/results/:testId', element: <ResultsPage /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
