import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown, Search, Bell, Sun, Moon, User,
  Menu, X, Activity, ShieldCheck, LogOut, Settings, Check
} from 'lucide-react'
import { useTheme } from './ThemeContext.jsx'

export const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    children: [
      { to: '/', label: 'Dashboard' },
      { to: '/map', label: 'PHC Map' },
    ]
  },
  {
    id: 'prediction',
    label: 'Prediction & AI',
    children: [
      { to: '/stockout', label: 'Stockout Risk' },
      { to: '/demand', label: 'Demand Forecast' },
      { to: '/resilience', label: 'Resilience Score' },
      { to: '/models', label: 'Model Comparison' },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    children: [
      { to: '/emergency', label: 'Emergency Simulation' },
      { to: '/redistribution', label: 'Redistribution' },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced',
    children: [
      { to: '/federated', label: 'Federated Learning' },
      { to: '/alerts', label: 'System Alerts' },
    ]
  },
]

export default function HeaderNav({ onOpenSearch, alertCount = 0, online = true }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const location = useLocation()
  const navigate = useNavigate()

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null)

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

  // Close dropdowns and mobile menu on route change
  useEffect(() => {
    setActiveDropdown(null)
    setProfileOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Helper to determine if a section is active
  const isSectionActive = (section) => {
    return section.children.some(child => {
      if (child.to === '/') return location.pathname === '/'
      return location.pathname.startsWith(child.to)
    })
  }

  const toggleDropdown = (id) => {
    setActiveDropdown(prev => (prev === id ? null : id))
  }

  return (
    <header className={`
      sticky top-0 z-50 w-full transition-colors select-none
      border-b
      ${isDark
        ? 'bg-[#0a1224] border-slate-800 text-slate-100'
        : 'bg-[#0c1f3d] border-[#162d54] text-white'
      }
    `}>
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px]">

          {/* ── LEFT: BRICS Health Official Emblem & Title ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 transition-transform group-hover:scale-105">
                <Activity size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-white leading-none">
                    BRICS HEALTH
                  </span>
                  <span className="hidden sm:inline-block text-[9.5px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    PORTAL
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium tracking-tight mt-1">
                  National Health Resilience Platform
                </span>
              </div>
            </Link>
          </div>

          {/* ── CENTER: Main Horizontal Government Navigation (Desktop) ── */}
          <nav ref={navRef} className="hidden lg:flex items-center h-full space-x-1 xl:space-x-2">
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
                      relative h-full flex items-center gap-1.5 px-3.5 text-sm font-medium transition-colors focus:outline-none
                      ${active
                        ? 'text-white font-semibold'
                        : 'text-slate-200 hover:text-white'
                      }
                    `}
                  >
                    <span>{section.label}</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`}
                    />

                    {/* Subtle active underline indicator */}
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-sky-400 rounded-t-sm" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div
                      className={`
                        absolute top-[calc(100%-4px)] left-0 w-52 py-1.5 rounded-lg shadow-lg border z-50
                        animate-in fade-in slide-in-from-top-1 duration-150
                        ${isDark
                          ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-black/40'
                          : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
                        }
                      `}
                    >
                      {section.children.map((item) => {
                        const isCurrent = item.to === '/'
                          ? location.pathname === '/'
                          : location.pathname.startsWith(item.to)

                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setActiveDropdown(null)}
                            className={`
                              flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left
                              ${isCurrent
                                ? isDark
                                  ? 'bg-sky-500/15 text-sky-400 font-semibold'
                                  : 'bg-blue-50 text-blue-700 font-semibold'
                                : isDark
                                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }
                            `}
                          >
                            <span>{item.label}</span>
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* ── RIGHT: User Controls & Tools ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className={`
                flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors
                ${isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                }
              `}
              title="Search dashboard (⌘K)"
            >
              <Search size={14} className="text-sky-300" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden xl:inline-block px-1 py-0.2 rounded text-[10px] font-mono bg-black/20 text-slate-300">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Icon with Badge */}
            <Link
              to="/alerts"
              className={`
                relative p-2 rounded-md transition-colors border
                ${isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                }
              `}
              title="System Alerts & Notifications"
            >
              <Bell size={16} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                p-2 rounded-md transition-colors border
                ${isDark
                  ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-white/10 border-white/20 text-amber-300 hover:bg-white/15'
                }
              `}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Admin User Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(prev => !prev)}
                aria-expanded={profileOpen}
                className={`
                  flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors
                  ${isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                  }
                `}
              >
                <div className="w-6 h-6 rounded bg-sky-500/30 text-sky-200 flex items-center justify-center font-bold text-[11px] font-mono">
                  AU
                </div>
                <span className="hidden sm:inline font-semibold">Admin</span>
                <ChevronDown size={12} className={`transition-transform duration-200 opacity-70 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div
                  className={`
                    absolute right-0 top-[calc(100%+6px)] w-60 py-2 rounded-lg shadow-xl border z-50
                    animate-in fade-in slide-in-from-top-1 duration-150
                    ${isDark
                      ? 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-black/50'
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
                    }
                  `}
                >
                  <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold truncate">Admin User</div>
                    <div className="text-[10px] text-slate-400">System Administrator</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{online ? 'Telemetry Grid Synced' : 'Backend Disconnected'}</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <div className="px-3.5 py-1.5 text-[10.5px] text-slate-400">
                      Jurisdiction: Karnataka Pilot (60 PHCs)
                    </div>
                    <Link
                      to="/alerts"
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      <Bell size={13} className="text-slate-400" />
                      <span>Active Incident Logs</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={`
                lg:hidden p-2 rounded-md border transition-colors ml-1
                ${isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-white/10 border-white/20 text-white'
                }
              `}
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>

        </div>
      </div>

      {/* ── MOBILE / TABLET EXPANDABLE DRAWER ── */}
      {mobileMenuOpen && (
        <div className={`
          lg:hidden border-t px-4 py-3 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto
          ${isDark ? 'bg-[#090e1a] border-slate-800' : 'bg-[#0c1f3d] border-[#162d54] text-white'}
        `}>
          {NAV_SECTIONS.map((section) => {
            const isExpanded = mobileExpandedSection === section.id
            const active = isSectionActive(section)

            return (
              <div key={section.id} className="border-b border-white/10 pb-2">
                <button
                  onClick={() => setMobileExpandedSection(prev => prev === section.id ? null : section.id)}
                  className={`
                    w-full flex items-center justify-between py-2 text-sm font-semibold text-left
                    ${active ? 'text-sky-300' : 'text-slate-200'}
                  `}
                >
                  <span>{section.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="pl-3 py-1 space-y-1">
                    {section.children.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          block py-1.5 text-xs font-medium transition-colors
                          ${location.pathname === item.to
                            ? 'text-sky-400 font-bold'
                            : 'text-slate-300 hover:text-white'
                          }
                        `}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Quick Info in Mobile Drawer */}
          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Jurisdiction: Karnataka Pilot</span>
            <span className="font-mono text-emerald-400">● LIVE</span>
          </div>
        </div>
      )}
    </header>
  )
}
