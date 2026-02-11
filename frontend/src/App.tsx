import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Portfolio from './pages/Portfolio'
import HistoryEntry from './pages/HistoryEntry'
import FirePage from './pages/FirePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/history" element={<HistoryEntry />} />
        <Route path="/fire" element={<FirePage />} />
      </Routes>
    </Layout>
  )
}

export default App
