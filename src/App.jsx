import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
import AdminAboutSettings from './admin/AdminAboutSettings.jsx'
import About from './pages/About.jsx'
import ProtectedRoute from './admin/ProtectedRoute.jsx'
import { useSiteConfig } from './hooks/useProjects.js'

function PortfolioApp() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const config = useSiteConfig()
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])

  const allRoutes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/site" element={<ProtectedRoute><AdminSiteSettings /></ProtectedRoute>} />
      <Route path="/admin/about" element={<ProtectedRoute><AdminAboutSettings /></ProtectedRoute>} />
      <Route path="/admin/projects/new" element={<ProtectedRoute><AdminProjectForm /></ProtectedRoute>} />
      <Route path="/admin/projects/:id/edit" element={<ProtectedRoute><AdminProjectForm /></ProtectedRoute>} />
    </Routes>
  )

  if (isAdmin) return allRoutes

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
          {allRoutes}
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
