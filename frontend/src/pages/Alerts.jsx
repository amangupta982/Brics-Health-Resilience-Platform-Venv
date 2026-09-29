import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Bell, Search, AlertTriangle, ShieldCheck, Clock, CheckCircle,
  ArrowUpRight, AlertOctagon, Filter, Check
} from 'lucide-react'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import toast from 'react-hot-toast'

export default function Alerts() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [acked, setAcked] = useState({})

  useEffect(() => {
    api.getAlerts()
      .then(data => setAlerts(data || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filter !== 'ALL' && a.severity !== filter) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchMsg = a.message?.toLowerCase().includes(term)
        const matchType = a.alert_type?.toLowerCase().includes(term)
        if (!matchMsg && !matchType) return false
      }
      return true
    })
  }, [alerts, filter, searchTerm])

  const counts = useMemo(() => ({
    ALL: alerts.length,
    CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
    HIGH: alerts.filter(a => a.severity === 'HIGH').length,
    MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: alerts.filter(a => a.severity === 'LOW').length,
  }), [alerts])

  const acknowledgeAlert = (id) => {
    setAcked(prev => ({ ...prev, [id]: true }))
    toast.success('Alert acknowledged and marked reviewed.')
  }

  const cardCls = isDark
    ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm'
    : 'bg-white border border-slate-200 shadow-sm'

  const inputCls = isDark
    ? 'bg-[#090e18] border border-white/[0.1] text-slate-200 focus:border-sky-500'
    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-sky-500'

  return (
    <div className="space-y-6">

      {/* ── Filter Bar & Search ── */}
      <div className={`rounded-2xl p-4 ${cardCls} flex flex-wrap items-center justify-between gap-4`}>
        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
            const active = filter === level
            return (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border font-mono
                  ${active
                    ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                    : isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {level} ({counts[level] || 0})
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter incidents by keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl outline-none transition-colors ${inputCls}`}
          />
        </div>
      </div>

      {/* ── Alerts Incident Feed ── */}
      <div className={`rounded-2xl p-5 ${cardCls}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Incident Stream ({filtered.length} Active Records)
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Early warning triggers and automated logistics threshold alerts
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 border border-dashed rounded-xl border-slate-700/40">
            <ShieldCheck size={32} className="mx-auto text-emerald-400 mb-2 opacity-80" />
            <div className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No Active Alerts in this Queue
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All monitored PHC facilities are currently operating within nominal parameters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const isAcknowledged = acked[a.id || i]
              return (
                <div
                  key={a.id || i}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3
                    ${isDark
                      ? isAcknowledged
                        ? 'bg-slate-900/20 border-white/[0.03] opacity-60'
                        : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/[0.05]'
                      : isAcknowledged
                        ? 'bg-slate-50 border-slate-100 opacity-60'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <StatusBadge level={a.severity} />
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {a.message || a.alert_type}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <Clock size={10} />
                        <span>{a.created_at ? new Date(a.created_at).toLocaleString() : 'Recent trigger'}</span>
                        <span>•</span>
                        <span>Type: {a.alert_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => acknowledgeAlert(a.id || i)}
                      disabled={isAcknowledged}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${isAcknowledged ? 'bg-slate-800 text-slate-500 border-slate-700' : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                    >
                      <Check size={12} />
                      <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>

                    <Link
                      to="/stockout"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600/10 text-sky-400 hover:bg-sky-600/20 transition-colors flex items-center gap-1"
                    >
                      <span>Triage</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
