import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronDown, Search, Bell, Sun, Moon,
  Menu, X, Home, Map, Clock, TrendingUp, ShieldCheck,
  BarChart3, Zap, RefreshCw, Globe, AlertTriangle, User,
  CheckCircle2, Building2, FileDown, LogOut
} from 'lucide-react'
import { auth, signOut } from '../firebase'
import toast from 'react-hot-toast'
import { useTheme } from './ThemeContext.jsx'
import { exportUniversalReport } from '../utils/pdfExport.js'

export const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    children: [
      { to: '/', label: 'Dashboard', icon: Home },
      { to: '/map', label: 'PHC Map', icon: Building2 },
    ]
  },
  {
    id: 'prediction',
    label: 'Prediction & AI',
    children: [
      { to: '/stockout', label: 'Stockout Risk', icon: Clock },
      { to: '/demand', label: 'Demand Forecast', icon: TrendingUp },
      { to: '/resilience', label: 'Resilience Score', icon: ShieldCheck },
      { to: '/models', label: 'Model Comparison', icon: BarChart3 },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    children: [
      { to: '/emergency', label: 'Emergency Simulation', icon: Zap },
      { to: '/redistribution', label: 'Redistribution', icon: RefreshCw },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced',
    children: [
      { to: '/federated', label: 'Federated Learning', icon: Globe },
      { to: '/alerts', label: 'System Alerts', icon: Bell },
    ]
  },
]

export default function HeaderNav({ onOpenSearch, alertCount = 2, online = true }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const location = useLocation()

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null)
  const [searchVal, setSearchVal] = useState('')

  const navRef = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns on route navigation
  useEffect(() => {
    setActiveDropdown(null)
    setProfileOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Check if a section contains the current active route
  const isSectionActive = (section) => {
    return section.children.some(child => {
      if (child.to === '/') return location.pathname === '/'
      return location.pathname.startsWith(child.to)
    })
  }

  const toggleDropdown = (id) => {
    setActiveDropdown(prev => (prev === id ? null : id))
  }

  const handleSignOut = async () => {
    try {
      setProfileOpen(false)
      await signOut(auth)
      toast.success('Signed out securely')
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full select-none shadow-md bg-[#12355B] border-b border-[#0d2744]">
      {/* ── SUBTLE GOVERNMENT HEALTHCARE BUILDING BACKGROUND WATERMARK ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle wide institutional building watermark spanning horizontally across the entire navbar */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('/hospital_watermark_banner.png')`,
            backgroundPosition: 'center 45%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}
        />
      </div>

      {/* ── HEADER CONTENT CONTAINER (74px height) ── */}
      <div className="relative max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px]">

          {/* ── LEFT: BRICS Health Official Emblem & Title ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              {/* Official White Badge with Medical Plus */}
              <div className="w-10 h-10 rounded-xl bg-white text-[#12355B] flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105">
                <svg className="w-6 h-6 fill-current text-[#12355B]" viewBox="0 0 24 24">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
                </svg>
              </div>

              {/* Title & Tagline */}
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white uppercase leading-none">
                  BRICS HEALTH
                </span>
                <span className="text-[9.5px] font-bold tracking-widest text-[#EAF4FB]/80 uppercase mt-1">
                  RESILIENCE PLATFORM
                </span>
              </div>
            </Link>
          </div>

          {/* ── CENTER: Main Horizontal Government Navigation ── */}
          <nav ref={navRef} className="hidden lg:flex items-center h-full space-x-1.5 xl:space-x-3">
            {NAV_SECTIONS.map((section) => {
              const active = isSectionActive(section)
              const isOpen = activeDropdown === section.id

              return (
                <div
                  key={section.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown(section.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* Top-level Nav Button */}
                  <button
                    onClick={() => toggleDropdown(section.id)}
                    aria-expanded={isOpen}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none
                      ${active
                        ? 'bg-[#1677C8] text-white shadow-sm border-b-2 border-white'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <span>{section.label}</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 opacity-80 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu (White Box with Light Blue/Gray border) */}
                  {isOpen && (
                    <div
                      className="absolute top-[calc(100%-8px)] left-0 w-52 py-1.5 rounded-xl shadow-2xl bg-white border border-[#D9E4EA] text-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      {section.children.map((item) => {
                        const Icon = item.icon
                        const isCurrent = item.to === '/'
                          ? location.pathname === '/'
                          : location.pathname.startsWith(item.to)

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setActiveDropdown(null)}
                            className={`
                              flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left
                              ${isCurrent
                                ? 'bg-[#EAF4FB] text-[#155E91] font-bold'
                                : 'text-slate-700 hover:bg-[#EAF4FB]/70 hover:text-[#155E91]'
                              }
                            `}
                          >
                            <Icon size={14} className={isCurrent ? 'text-[#1677C8]' : 'text-slate-500'} />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* ── RIGHT: User Controls (Search, Bell, Moon, Admin Profile) ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Search Input Box */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search district, facility or keyword..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onClick={onOpenSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenSearch()
                }}
                className="w-56 lg:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white text-slate-800 placeholder:text-slate-400 border border-[#D9E4EA] shadow-sm outline-none focus:ring-2 focus:ring-[#1677C8] transition-all cursor-pointer"
                readOnly
              />
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-white hover:text-slate-200 transition-colors"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Universal Download Report Button */}
            <button
              onClick={async () => {
                try {
                  toast.loading('Exporting report PDF...', { id: 'report-dl' })
                  const fileName = await exportUniversalReport(location.pathname)
                  toast.success(`Downloaded: ${fileName}`, { id: 'report-dl' })
                } catch (err) {
                  console.error(err)
                  toast.error('Failed to export PDF report', { id: 'report-dl' })
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 shadow-sm transition-all cursor-pointer"
              title="Download official PDF report for current page"
            >
              <FileDown size={14} className="text-sky-300" />
              <span className="hidden sm:inline">Download Report</span>
            </button>

            {/* Notifications Icon with Badge (Min 2 as in screenshot) */}
            <Link
              to="/alerts"
              className="relative p-2 text-white hover:text-slate-200 transition-colors"
              title="System Alerts & Notifications"
            >
              <Bell size={18} className="fill-current" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9.5px] font-bold flex items-center justify-center font-mono ring-2 ring-[#12355B]">
                {alertCount > 0 ? alertCount : 2}
              </span>
            </Link>

            {/* Dark Mode Icon */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white hover:text-slate-200 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Admin User Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(prev => !prev)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                {/* AU Circle Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#1677C8] text-white font-bold flex items-center justify-center text-xs shadow-sm ring-1 ring-white/30 shrink-0">
                  AU
                </div>

                <div className="hidden sm:flex flex-col min-w-0">
                  <div className="flex items-center gap-1 leading-tight">
                    <span className="text-xs font-bold text-white">Admin User</span>
                    <ChevronDown size={11} className={`text-slate-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium leading-none mt-0.5">
                    System Administrator
                  </span>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-60 py-2 rounded-xl shadow-2xl bg-white border border-[#D9E4EA] text-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">Admin User</div>
                    <div className="text-[10px] text-slate-500">System Administrator</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{online ? 'Telemetry Grid Synced' : 'Backend Disconnected'}</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <div className="px-4 py-1.5 text-[10.5px] text-slate-500 font-medium">
                      Jurisdiction: Karnataka Pilot (60 PHCs)
                    </div>
                    <Link
                      to="/alerts"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[#EAF4FB] text-slate-700 transition-colors font-medium"
                    >
                      <Bell size={13} className="text-[#155E91]" />
                      <span>Active Incidents & Alerts</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors font-medium text-left"
                    >
                      <LogOut size={13} />
                      <span>Secure Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-white hover:text-slate-200 transition-colors ml-1"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>

        </div>
      </div>

      {/* ── MOBILE / TABLET EXPANDABLE DRAWER ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#155E91] px-4 py-3 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto bg-[#12355B] text-white">
          {NAV_SECTIONS.map((section) => {
            const isExpanded = mobileExpandedSection === section.id
            const active = isSectionActive(section)

            return (
              <div key={section.id} className="border-b border-white/10 pb-2">
                <button
                  onClick={() => setMobileExpandedSection(prev => prev === section.id ? null : section.id)}
                  className={`
                    w-full flex items-center justify-between py-2 text-sm font-semibold text-left
                    ${active ? 'text-[#EAF4FB] font-bold' : 'text-slate-200'}
                  `}
                >
                  <span>{section.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="pl-3 py-1 space-y-1">
                    {section.children.map((item) => {
                      const Icon = item.icon
                      const isCurrent = location.pathname === item.to

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-2 py-1.5 text-xs font-medium transition-colors
                            ${isCurrent
                              ? 'text-sky-300 font-bold'
                              : 'text-slate-300 hover:text-white'
                            }
                          `}
                        >
                          <Icon size={13} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <div className="pt-2 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Karnataka Pilot Surveillance Grid</span>
            <span className="font-mono text-emerald-300">● LIVE</span>
          </div>
        </div>
      )}
    </header>
  )
}
