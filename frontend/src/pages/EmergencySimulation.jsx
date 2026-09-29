import { useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Zap, AlertTriangle, TrendingUp, Activity, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import KpiCard from '../components/KpiCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const SCENARIOS = [
  { value: 'dengue_outbreak', label: 'Dengue Outbreak', icon: '🦟', desc: '1.8x patient surge, 2.2x IV Fluid/Paracetamol demand spike' },
  { value: 'flu_surge', label: 'Seasonal Flu Surge', icon: '🤧', desc: '1.4x patient surge, 1.3x antipyretic demand increase' },
  { value: 'gi_outbreak', label: 'Waterborne GI Outbreak', icon: '💧', desc: '1.6x patient surge, 2.0x ORS and antibiotic demand' },
  { value: '', label: 'Custom Stress-Test', icon: '🎛️', desc: 'Configure custom outbreak shock parameters manually' },
]

export default function EmergencySimulation() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [scenario, setScenario] = useState('dengue_outbreak')
  const [patientIncrease, setPatientIncrease] = useState(0)
  const [supplyDisruption, setSupplyDisruption] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runSimulation = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await api.simulateEmergency({
        scenario: scenario || null,
        patient_increase_pct: Number(patientIncrease),
        supply_disruption_pct: Number(supplyDisruption),
      })
      setResult(res)
      toast.success('Simulation executed: network resilience stress-tested under scenario shock.')
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Simulation failed. Check backend logs.')
    } finally {
      setLoading(false)
    }
  }

  const cardCls = isDark
    ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm'
    : 'bg-white border border-slate-200 shadow-sm'

  const ttStyle = {
    background: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: 12,
    fontSize: 12,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
    color: isDark ? '#f8fafc' : '#0f172a',
  }

  const chartData = result ? [
    {
      name: 'Network Mean Risk',
      'Baseline Pre-Shock': +(result.avg_risk_before * 100).toFixed(1),
      'Post-Shock Stress': +(result.avg_risk_after * 100).toFixed(1),
    },
    {
      name: 'Peak Facility Risk',
      'Baseline Pre-Shock': +(result.max_risk_before * 100).toFixed(1),
      'Post-Shock Stress': +(result.max_risk_after * 100).toFixed(1),
    },
  ] : []

  return (
    <div className="space-y-6">

      {/* ── Scenario Selection & Configuration ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 ${cardCls}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Epidemic Outbreak & Supply Shock Simulator
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Stress-test network inventory and bed availability against simulated crisis scenarios
            </p>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold self-start ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            WHAT-IF MODELING
          </span>
        </div>

        {/* 4 Scenario Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {SCENARIOS.map(s => {
            const active = scenario === s.value
            return (
              <div
                key={s.value}
                onClick={() => setScenario(s.value)}
                className={`p-4 rounded-xl border cursor-pointer transition-all
                  ${active
                    ? isDark
                      ? 'bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-950/30'
                      : 'bg-rose-50 border-rose-300 shadow-sm'
                    : isDark
                      ? 'bg-[#0a101d] border-white/[0.06] hover:border-white/[0.14]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-xs font-bold mb-1 ${active ? 'text-rose-400' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {s.label}
                </div>
                <div className="text-[10.5px] text-slate-400 leading-snug">
                  {s.desc}
                </div>
              </div>
            )
          })}
        </div>

        {/* Manual Sliders if custom or active */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border mb-5 border-slate-700/20 bg-slate-900/20">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Patient Influx Surge:</span>
              <span className="font-mono font-bold text-rose-400">+{patientIncrease}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              value={patientIncrease}
              onChange={e => setPatientIncrease(e.target.value)}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Supply Chain Disruption:</span>
              <span className="font-mono font-bold text-amber-400">-{supplyDisruption}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={supplyDisruption}
              onChange={e => setSupplyDisruption(e.target.value)}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
          {loading ? 'Simulating Shock Dynamics...' : 'Execute Crisis Simulation'}
        </button>
      </motion.div>

      {/* ── Simulation Results ── */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Result KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Pre-Shock Mean Risk"
              value={`${(result.avg_risk_before * 100).toFixed(1)}%`}
              unit=""
              icon={Activity}
              color="blue"
              sub="Normal operational baseline"
              delay={0.02}
            />
            <KpiCard
              label="Post-Shock Mean Risk"
              value={`${(result.avg_risk_after * 100).toFixed(1)}%`}
              unit=""
              icon={AlertTriangle}
              color="red"
              sub="Projected vulnerability across grid"
              trend={+((result.avg_risk_after - result.avg_risk_before) * 100).toFixed(1)}
              trendLabel={`+${((result.avg_risk_after - result.avg_risk_before) * 100).toFixed(1)}% risk elevation`}
              delay={0.05}
            />
            <KpiCard
              label="Facilities Breaching Buffer"
              value={result.newly_at_risk_phcs?.length || 0}
              unit="critical facilities"
              icon={ShieldAlert}
              color="orange"
              sub="Need immediate buffer dispatch"
              delay={0.08}
            />
          </div>

          {/* Bar Chart Shock Comparison */}
          <div className={`rounded-2xl p-5 ${cardCls}`}>
            <h3 className={`text-sm font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Baseline vs Stress-Tested Risk Comparison
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Mean network stockout probability and peak vulnerable facility risk
            </p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={ttStyle} />
                  <Bar dataKey="Baseline Pre-Shock" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Post-Shock Stress" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  )
}
