import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from './components/ThemeContext.jsx'
import api from './services/api'

import Overview from './pages/Overview.jsx'
import PHCMapPage from './pages/PHCMapPage.jsx'
import StockoutRisk from './pages/StockoutRisk.jsx'
import DemandForecast from './pages/DemandForecast.jsx'
import EmergencySimulation from './pages/EmergencySimulation.jsx'
import ResourceRedistribution from './pages/ResourceRedistribution.jsx'
import DistrictResilience from './pages/DistrictResilience.jsx'
import ModelComparison from './pages/ModelComparison.jsx'
import FederatedLearning from './pages/FederatedLearning.jsx'
import Alerts from './pages/Alerts.jsx'

import HeaderNav from './components/HeaderNav.jsx'
import CommandPalette from './components/CommandPalette.jsx'

export default function App() {
  const { theme } = useTheme()
  const location = useLocation()
  const isDark = theme === 'dark'

  const [online, setOnline] = useState(true)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  // Polling for health check & alerts
  useEffect(() => {
    let isMounted = true
    const check = async () => {
      try {
        const r = await api.checkHealth()
        if (isMounted) setOnline(r?.status === 'healthy')
      } catch {
        if (isMounted) setOnline(false)
      }
      try {
        const a = await api.getAlerts()
        if (isMounted && a) {
          const crit = a.filter(item => item.severity === 'CRITICAL' || item.severity === 'HIGH').length
          setAlertCount(crit)
        }
      } catch {
        // ignore
      }
    }
    check()
    const iv = setInterval(() => {
      check()
    }, 8000)
    return () => {
      isMounted = false
      clearInterval(iv)
    }
  }, [])

  // Cmd+K keyboard shortcut listener for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`flex flex-col min-h-screen ${isDark ? 'bg-[#090e18] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* ── Global Command Palette Modal ── */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* ── Top Horizontal Government Navigation Bar ── */}
      <HeaderNav
        onOpenSearch={() => setCmdOpen(true)}
        alertCount={alertCount}
        online={online}
      />

      {/* ── Main Dashboard Content Viewport (Full Width, No Sidebar) ── */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/map" element={<PHCMapPage />} />
              <Route path="/stockout" element={<StockoutRisk />} />
              <Route path="/demand" element={<DemandForecast />} />
              <Route path="/emergency" element={<EmergencySimulation />} />
              <Route path="/redistribution" element={<ResourceRedistribution />} />
              <Route path="/resilience" element={<DistrictResilience />} />
              <Route path="/models" element={<ModelComparison />} />
              <Route path="/federated" element={<FederatedLearning />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  )
}
