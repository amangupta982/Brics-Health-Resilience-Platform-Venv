import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, Map, AlertTriangle, TrendingUp,
  ShieldCheck, BarChart3, Zap, RefreshCw, Globe, Bell,
  ArrowRight, Command, X, Building2, Pill
} from 'lucide-react'
import { useTheme } from './ThemeContext.jsx'

const QUICK_LINKS = [
  { label: 'Overview Dashboard', path: '/', icon: LayoutDashboard, category: 'Navigation', shortcut: 'G D' },
  { label: 'PHC Geospatial Map', path: '/map', icon: Map, category: 'Navigation', shortcut: 'G M' },
  { label: 'Stockout Risk Prediction (7-Day Early Warning)', path: '/stockout', icon: AlertTriangle, category: 'AI Models', badge: 'LightGBM' },
  { label: 'Multi-Horizon Demand Forecast (1d-30d)', path: '/demand', icon: TrendingUp, category: 'AI Models', badge: 'XGBoost' },
  { label: 'Emergency / Outbreak Simulation', path: '/emergency', icon: Zap, category: 'Operations', badge: 'Sim' },
  { label: 'Cross-District Resource Redistribution', path: '/redistribution', icon: RefreshCw, category: 'Operations', badge: 'OR-Tools LP' },
  { label: 'District Health Resilience Index', path: '/resilience', icon: ShieldCheck, category: 'Analytics', badge: '0-100' },
  { label: 'Model Benchmark & Champion Validation', path: '/models', icon: BarChart3, category: 'AI Models', badge: 'PR-AUC' },
  { label: 'BRICS Federated Learning Federation', path: '/federated', icon: Globe, category: 'Advanced', badge: 'FedAvg' },
  { label: 'Incident & Prediction Alerts', path: '/alerts', icon: Bell, category: 'Operations', badge: 'Realtime' },
]

const POPULAR_MEDICINES = [
  'Paracetamol', 'ORS', 'Amoxicillin', 'Chloroquine/ACT',
  'Insulin', 'IV Fluids', 'Doxycycline', 'Iron Folic Acid'
]

const KEY_DISTRICTS = [
  'Bengaluru Rural', 'Belagavi', 'Shivamogga', 'Mysuru', 'Tumakuru',
  'Ballari', 'Kalaburagi', 'Davanagere', 'Dakshina Kannada', 'Udupi'
]

export default function CommandPalette({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, query])

  // Filter items based on query
  const q = query.trim().toLowerCase()

  const matchedLinks = QUICK_LINKS.filter(item =>
    item.label.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    (item.badge && item.badge.toLowerCase().includes(q))
  )

  const matchedMedicines = POPULAR_MEDICINES.filter(m => m.toLowerCase().includes(q)).map(m => ({
    label: `Inspect ${m} Inventory & Forecast`,
    path: `/stockout`,
    icon: Pill,
    category: 'Essential Medicines',
    badge: 'Clinical Formulary'
  }))

  const matchedDistricts = KEY_DISTRICTS.filter(d => d.toLowerCase().includes(q)).map(d => ({
    label: `${d} District Readiness & Resilience`,
    path: `/resilience`,
    icon: Building2,
    category: 'Operational Districts',
    badge: 'Zone'
  }))

  const filteredItems = q.length === 0
    ? QUICK_LINKS
    : [...matchedLinks, ...matchedMedicines.slice(0, 3), ...matchedDistricts.slice(0, 3)]

  const handleSelect = (item) => {
    onClose()
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className={`
            relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden z-10 border
            ${isDark
              ? 'bg-[#0e1626] border-slate-700/60 text-slate-100 shadow-cyan-950/30'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
            }
          `}
        >
          {/* Search Input Bar */}
          <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <Search size={18} className="text-sky-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command, search facility, medicine, or module..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-slate-500/10 text-slate-400">
                <X size={14} />
              </button>
            )}
            <kbd className={`hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No matching results found for "{query}".
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const Icon = item.icon || ArrowRight
                const isSelected = idx === selectedIndex
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`
                      flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors
                      ${isSelected
                        ? isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-900'
                        : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isSelected ? (isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-700') : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                        <Icon size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight size={12} className={`opacity-0 ${isSelected ? 'opacity-100 text-sky-400' : ''}`} />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className={`flex items-center justify-between px-4 py-2 text-[11px] border-t ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="flex items-center gap-3">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to dismiss</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
