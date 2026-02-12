import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import ProtectedRoute from './auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'
import HistoryEntry from './pages/HistoryEntry'
import FirePage from './pages/FirePage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/history" element={<HistoryEntry />} />
                  <Route path="/fire" element={<FirePage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
