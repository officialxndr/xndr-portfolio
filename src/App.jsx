import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen.jsx'
import LiquidGradient from './components/LiquidGradient.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AdminProjectForm from './admin/AdminProjectForm.jsx'
import AdminSiteSettings from './admin/AdminSiteSettings.jsx'
import ProtectedRoute from './admin/ProtectedRoute.jsx'
import { useSiteConfig } from './hooks/useProjects.js'

function PortfolioApp() {
  const config = useSiteConfig()
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])

  return (
    <>
      <LiquidGradient />

      <AnimatePresence>
        {loading && <LoadingScreen key="loader" onComplete={done} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
        >
          <Navbar siteName={config.site_name || import.meta.env.VITE_SITE_NAME} logo={config.logo || null} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/site" element={<ProtectedRoute><AdminSiteSettings /></ProtectedRoute>} />
            <Route path="/admin/projects/new" element={<ProtectedRoute><AdminProjectForm /></ProtectedRoute>} />
            <Route path="/admin/projects/:id/edit" element={<ProtectedRoute><AdminProjectForm /></ProtectedRoute>} />
          </Routes>
        </motion.div>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioApp />
    </BrowserRouter>
  )
}
