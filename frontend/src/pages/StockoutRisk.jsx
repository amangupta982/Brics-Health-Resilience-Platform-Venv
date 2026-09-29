import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import KpiCard from '../components/KpiCard.jsx'
import ModelComparisonCard from '../components/ModelComparisonCard.jsx'
import ExplanationDrivers from '../components/ExplanationDrivers.jsx'
import RiskGauge from '../components/RiskGauge.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  AlertTriangle, Package, Clock, ShieldCheck,
  Search, Loader2, RefreshCw, Zap, ArrowRight, CheckCircle2,
  AlertOctagon, Info
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

const QUICK_PRESETS = [
  { code: 'BEN-PHC01', med: 'Paracetamol', label: 'Bengaluru • Paracetamol' },
  { code: 'KAL-PHC01', med: 'Insulin', label: 'Kalaburagi • Insulin (Remote)' },
  { code: 'BEL-PHC01', med: 'Amoxicillin', label: 'Belagavi • Amoxicillin' },
]

export default function StockoutRisk() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [phcs, setPhcs] = useState(DEFAULT_PHCS)
  const [phcId, setPhcId] = useState('BEN-PHC01')
  const [medicine, setMedicine] = useState(MEDICINES[0])
  const [result, setResult] = useState(null)
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

  const runPrediction = async (customPhc, customMed) => {
    const targetPhc = customPhc || phcId
    const targetMed = customMed || medicine
    if (!targetPhc) {
      toast.error('Please select a valid PHC facility.')
      return
    }
    setLoading(true)
    try {
      const res = await api.predictStockout({ phc_id: targetPhc, medicine: targetMed })
      setResult(res)
      toast.success(`Risk evaluated: ${res.risk_level} (${(res.stockout_probability * 100).toFixed(1)}%)`)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Prediction failed. Please ensure the backend is running.')
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

  return (
    <div className="space-y-6">

      {/* ── Diagnostic Control Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 ${cardCls}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Stockout Risk Diagnostic Engine
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              7-day forward early warning trained on multi-district consumption, lead times, and facility capacity
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
            {QUICK_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPhcId(p.code)
                  setMedicine(p.med)
                  runPrediction(p.code, p.med)
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Facility Selection (PHC)
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
              Essential Medicine Formulary
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
              onClick={() => runPrediction()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? 'Evaluating Model Ensemble...' : 'Evaluate 7-Day Risk'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Diagnostic Results ── */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Top Triage Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4
            ${result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH'
              ? isDark ? 'bg-rose-950/20 border-rose-500/30' : 'bg-rose-50 border-rose-200'
              : isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            }
          `}>
            <div className="flex items-center gap-3">
              {result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH' ? (
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertOctagon size={20} />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    Diagnostic Verdict: {result.risk_level} Stockout Threat
                  </span>
                  <StatusBadge level={result.risk_level} />
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH'
                    ? 'Facility requires immediate buffer replenishment or inter-facility transfer order to avoid medicine outage.'
                    : 'Facility inventory levels remain within safe operational bounds for the next 7 days.'
                  }
                </p>
              </div>
            </div>

            {(result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH') && (
              <Link
                to="/redistribution"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Generate Transfer Order</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {/* Primary Metrics Row with Risk Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className={`md:col-span-5 rounded-2xl p-5 ${cardCls} flex flex-col items-center justify-center`}>
              <RiskGauge probability={result.stockout_probability} size={230} />
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KpiCard
                label="Inventory On-Hand"
                value={result.current_stock}
                unit="units"
                icon={Package}
                color={result.current_stock < 40 ? 'red' : result.current_stock < 100 ? 'orange' : 'green'}
                sub="Current physical stock counted"
                delay={0.05}
              />

              <KpiCard
                label="Days to Full Stockout"
                value={result.expected_stockout_days ?? '—'}
                unit={result.expected_stockout_days ? 'days' : ''}
                icon={Clock}
                color={result.expected_stockout_days < 7 ? 'red' : result.expected_stockout_days < 14 ? 'orange' : 'green'}
                sub={`Burn rate: ${result.predicted_demand_per_day?.toFixed(1) || 0} units/day`}
                delay={0.08}
              />

              <KpiCard
                label="Evaluated Facility"
                value={result.phc_id}
                unit=""
                icon={ShieldCheck}
                color="blue"
                sub={`Drug: ${result.medicine}`}
                delay={0.11}
              />

              <KpiCard
                label="Champion Architecture"
                value={result.selected_model}
                unit=""
                icon={Zap}
                color="violet"
                sub="Highest PR-AUC validation rank"
                delay={0.14}
              />
            </div>
          </div>

          {/* Explainability & Model Ensemble Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExplanationDrivers topDrivers={result.top_drivers} />
            <ModelComparisonCard
              allModelOutputs={result.all_model_outputs}
              selectedModel={result.selected_model}
              selectionReason={result.selection_reason}
            />
          </div>
        </motion.div>
      )}

    </div>
  )
}
