import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import Browse from './pages/Browse'
import FileClaimNew from './pages/FileClaimNew'
import Claims from './pages/Claims'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <div className="min-h-screen bg-campus-bg">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/claims/new" element={<FileClaimNew />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
