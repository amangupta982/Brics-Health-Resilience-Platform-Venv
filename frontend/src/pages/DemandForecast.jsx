import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, Cell
} from 'recharts'
import { TrendingUp, Clock, ShieldCheck, Loader2, Calendar, Pill, Building2, BarChart2, FileDown } from 'lucide-react'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import KpiCard from '../components/KpiCard.jsx'
import ModelComparisonCard from '../components/ModelComparisonCard.jsx'
import { exportUniversalReport } from '../utils/pdfExport.js'

const HORIZONS = [
  { days: 1, label: '1-Day Tactical', sub: 'Immediate dispatch' },
  { days: 7, label: '7-Day Weekly', sub: 'Standard replenishment' },
  { days: 14, label: '14-Day Bi-Weekly', sub: 'Buffer planning' },
  { days: 30, label: '30-Day Monthly', sub: 'Macro procurement' },
]

const MEDICINES = [
  'Paracetamol', 'ORS', 'Amoxicillin', 'Chloroquine/ACT',
  'Insulin', 'IV Fluids', 'Doxycycline', 'Iron Folic Acid'
]

const DEFAULT_PHCS = [
  { code: 'BEN-PHC01', name: 'Bengaluru Rural Central PHC', district: 'Bengaluru Rural' },
  { code: 'BEN-PHC02', name: 'Devanahalli PHC', district: 'Bengaluru Rural' },
  { code: 'BEL-PHC01', name: 'Belagavi North PHC', district: 'Belagavi' },
  { code: 'KAL-PHC01', name: 'Kalaburagi Main PHC', district: 'Kalaburagi' },
  { code: 'MYS-PHC01', name: 'Mysuru City PHC', district: 'Mysuru' },
]

export default function DemandForecast() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [phcs, setPhcs] = useState(DEFAULT_PHCS)
  const [phcId, setPhcId] = useState('BEN-PHC01')
  const [medicine, setMedicine] = useState(MEDICINES[0])
  const [activeH, setActiveH] = useState(7)
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getPHCs()
      .then(data => {
        if (data && data.length > 0) {
          setPhcs(data)
          if (!phcId) setPhcId(data[0].code)
        }
      })
      .catch(() => {})
  }, [])

  const runAllHorizons = async () => {
    if (!phcId) {
      toast.error('Please select a valid PHC facility.')
      return
    }
    setLoading(true)
    setResults({})
    try {
      const all = await Promise.all(
        HORIZONS.map(h =>
          api.predictDemand({ phc_id: phcId, medicine, horizon_days: h.days })
            .then(r => [h.days, r])
        )
      )
      const map = Object.fromEntries(all)
      setResults(map)
      setActiveH(7)
      toast.success('Multi-horizon forecasts calculated across 1d, 7d, 14d, and 30d.')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Demand forecasting failed. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const cardCls = isDark
    ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm'
    : 'bg-white border border-slate-200 shadow-sm'

  const inputCls = isDark
    ? 'bg-[#090e18] border border-white/[0.1] text-slate-200 focus:border-sky-500'
    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-sky-500'

  const ttStyle = {
    background: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: 12,
    fontSize: 12,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
    color: isDark ? '#f8fafc' : '#0f172a',
  }

  // Horizon comparison bar chart data
  const compareData = HORIZONS.map(h => ({
    name: `${h.days}-Day`,
    value: results[h.days]?.final_prediction ?? 0,
    model: results[h.days]?.selected_model ?? '',
  }))

  const activeResult = results[activeH]

  // Synthetic area projection points for the active horizon
  const projectionPoints = activeResult ? Array.from({ length: activeH }).map((_, i) => {
    const day = i + 1
    const avgPerDay = (activeResult.final_prediction || 0) / activeH
    // Slight realistic fluctuation curve
    const wave = Math.sin((day / activeH) * Math.PI) * 0.15
    const demand = +(avgPerDay * day * (1 + wave)).toFixed(1)
    return {
      day: `Day +${day}`,
      cumulativeDemand: demand,
      dailyRate: +(avgPerDay * (1 + wave)).toFixed(1),
    }
  }) : []

  return (
    <div className="space-y-6">

      {/* ── Forecast Configuration Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 ${cardCls}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Multi-Horizon Demand Projection Engine
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Predicts aggregate pharmaceutical consumption units across operational planning horizons
            </p>
          </div>

          <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border self-start ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            Ensemble: XGBoost + LSTM + Rolling MA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Monitored PHC Facility
            </label>
            <select
              value={phcId}
              onChange={e => setPhcId(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs outline-none transition-colors ${inputCls}`}
            >
              {phcs.map(p => (
                <option key={p.code} value={p.code}>
                  {p.code} — {p.name || p.district} ({p.district})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Medicine Formulary
            </label>
            <select
              value={medicine}
              onChange={e => setMedicine(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs outline-none transition-colors ${inputCls}`}
            >
              {MEDICINES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={runAllHorizons}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <TrendingUp size={15} />}
              {loading ? 'Forecasting 4 Horizons...' : 'Generate Forecasts'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Forecast Results ── */}
      {Object.keys(results).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Status & Report Action Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Select Planning Horizon:
              </span>
            </div>
            <button
              onClick={async () => {
                try {
                  toast.loading('Generating demand forecast report...', { id: 'df-dl' })
                  const fileName = await exportUniversalReport('/demand')
                  toast.success(`Report downloaded: ${fileName}`, { id: 'df-dl' })
                } catch (err) {
                  console.error(err)
                  toast.error('Failed to generate report PDF', { id: 'df-dl' })
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <FileDown size={14} />
              <span>Download Forecast Report (PDF)</span>
            </button>
          </div>

          {/* Horizon Selection Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {HORIZONS.map(h => {
              const active = activeH === h.days
              const r = results[h.days]
              return (
                <button
                  key={h.days}
                  onClick={() => setActiveH(h.days)}
                  className={`flex-1 min-w-[150px] p-3.5 rounded-2xl border text-left transition-all
                    ${active
                      ? isDark
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-md shadow-sky-950/40'
                        : 'bg-sky-50 border-sky-300 text-sky-950 shadow-sm'
                      : isDark
                        ? 'bg-[#0e1626] border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{h.label}</span>
                    <span className="text-[10px] font-mono opacity-70">+{h.days}d</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono-num">
                    {r ? `${Math.round(r.final_prediction)} units` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {r?.selected_model ? `Model: ${r.selected_model}` : h.sub}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Horizon Analysis Row */}
          {activeResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Cumulative Projection Curve */}
              <div className={`lg:col-span-8 rounded-2xl p-5 ${cardCls}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Cumulative Demand Trajectory ({activeH}-Day Horizon)
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Expected cumulative consumption curve with estimated daily velocity
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                    Total: {Math.round(activeResult.final_prediction)} units
                  </span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionPoints} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                      <defs>
                        <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={ttStyle} />
                      <Area
                        type="monotone"
                        dataKey="cumulativeDemand"
                        name="Cumulative Units"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        fill="url(#demandGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Multi-Horizon Cross Comparison */}
              <div className={`lg:col-span-4 rounded-2xl p-5 ${cardCls} flex flex-col justify-between`}>
                <div>
                  <h3 className={`text-sm font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Horizon Volume Comparison
                  </h3>
                  <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Projected requirement scale across all 4 timeframes
                  </p>

                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={compareData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={ttStyle} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {compareData.map((d, i) => (
                            <Cell
                              key={i}
                              fill={d.name.includes(`${activeH}-Day`) ? '#0284c7' : '#64748b'}
                              fillOpacity={d.name.includes(`${activeH}-Day`) ? 1 : 0.4}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-700/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Daily Average Velocity:</span>
                    <span className="font-bold font-mono-num">
                      {(activeResult.final_prediction / activeH).toFixed(1)} units/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Selected Champion Model:</span>
                    <span className="font-bold text-sky-400 font-mono">
                      {activeResult.selected_model}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Model Comparison for this Horizon */}
          {activeResult && (
            <ModelComparisonCard
              allModelOutputs={activeResult.all_model_outputs}
              selectedModel={activeResult.selected_model}
              selectionReason={activeResult.selection_reason}
            />
          )}
        </motion.div>
      )}

    </div>
  )
}
