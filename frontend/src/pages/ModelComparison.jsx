import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import { Trophy, ShieldCheck, BarChart3, Loader2, Calendar, CheckCircle2, Info, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import { exportUniversalReport } from '../utils/pdfExport.js'

const TASK_LABELS = {
  stockout_classification: 'Stockout Classification (7-Day Early Warning)',
  demand_forecast_1d: 'Demand Forecasting (1-Day Horizon)',
  demand_forecast_7d: 'Demand Forecasting (7-Day Horizon)',
  demand_forecast_14d: 'Demand Forecasting (14-Day Horizon)',
  demand_forecast_30d: 'Demand Forecasting (30-Day Horizon)',
}

const MODEL_PALETTE = {
  xgboost: '#0284c7',
  lightgbm: '#6366f1',
  lstm: '#10b981',
  naive_lag1: '#64748b',
  moving_average_7d: '#94a3b8',
  logistic_regression: '#f97316',
  baseline: '#475569',
}

export default function ModelComparison() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [allPerf, setAllPerf] = useState([])
  const [activeTask, setActiveTask] = useState('stockout_classification')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getModelPerformance()
      .then(data => {
        setAllPerf(data || [])
        if (data && data.length > 0) {
          const tasks = [...new Set(data.map(d => d.task))]
          if (tasks.includes('stockout_classification')) {
            setActiveTask('stockout_classification')
          } else {
            setActiveTask(tasks[0])
          }
        }
      })
      .catch(() => setAllPerf([]))
      .finally(() => setLoading(false))
  }, [])

  const tasks = useMemo(() => {
    return [...new Set(allPerf.map(r => r.task))]
  }, [allPerf])

  const taskRows = useMemo(() => {
    return allPerf.filter(r => r.task === activeTask)
  }, [allPerf, activeTask])

  const champion = useMemo(() => {
    return taskRows.find(r => r.is_current_champion)
  }, [taskRows])

  const metricKeys = useMemo(() => {
    const keys = new Set()
    taskRows.forEach(r => {
      if (r.metrics) {
        Object.keys(r.metrics).forEach(k => {
          if (typeof r.metrics[k] === 'number') keys.add(k)
        })
      }
    })
    return [...keys]
  }, [taskRows])

  const chartData = useMemo(() => {
    const primaryMetric = activeTask === 'stockout_classification' ? 'pr_auc' : 'mae'
    return taskRows.map(r => ({
      name: r.model_name,
      [primaryMetric.toUpperCase()]: r.metrics?.[primaryMetric] ? +r.metrics[primaryMetric].toFixed(4) : 0,
      isChamp: r.is_current_champion,
    }))
  }, [taskRows, activeTask])

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

  return (
    <div className="space-y-6">

      {/* ── Task Tabs & Report Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tasks.map(t => {
            const active = activeTask === t
            return (
              <button
                key={t}
                onClick={() => setActiveTask(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border
                  ${active
                    ? isDark
                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm'
                      : 'bg-sky-50 text-sky-950 border-sky-300 shadow-sm'
                    : isDark
                      ? 'bg-[#0e1626] border-white/[0.06] text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }
                `}
              >
                {TASK_LABELS[t] || t}
              </button>
            )
          })}
        </div>

        <button
          onClick={async () => {
            try {
              toast.loading('Exporting model performance audit...', { id: 'mc-dl' })
              const fileName = await exportUniversalReport('/models')
              toast.success(`Audit downloaded: ${fileName}`, { id: 'mc-dl' })
            } catch (err) {
              console.error(err)
              toast.error('Failed to generate audit PDF', { id: 'mc-dl' })
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <FileDown size={14} />
          <span>Download Audit Report (PDF)</span>
        </button>
      </div>

      {/* ── Champion Summary Banner ── */}
      {champion && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  Certified Champion Model: {champion.model_name}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800'}`}>
                  SERVING INFERENCE
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Selected by empirical superiority on held-out temporal cross-validation datasets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
            {champion.metrics && Object.entries(champion.metrics).slice(0, 3).map(([k, v]) => (
              <div key={k} className="text-right">
                <div className="text-[10px] uppercase text-slate-400">{k}</div>
                <div className="font-bold text-emerald-400">{typeof v === 'number' ? v.toFixed(4) : v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Primary Benchmark Comparison Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Primary Metric Chart */}
        <div className={`lg:col-span-6 rounded-2xl p-5 ${cardCls}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Primary Evaluation Metric Ranking
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeTask === 'stockout_classification' ? 'Precision-Recall Area Under Curve (PR-AUC)' : 'Mean Absolute Error (MAE)'}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Time-Split Validated</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={ttStyle} />
                <Bar
                  dataKey={activeTask === 'stockout_classification' ? 'PR_AUC' : 'MAE'}
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.isChamp ? '#10b981' : (MODEL_PALETTE[d.name] || '#0284c7')}
                      fillOpacity={d.isChamp ? 1 : 0.55}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Validation Methodology & Governance */}
        <div className={`lg:col-span-6 rounded-2xl p-5 ${cardCls} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-sky-400" />
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Governance & Temporal Validation Rigor
              </h3>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed mb-4`}>
              Models are evaluated strictly on rolling temporal splits (train on past, evaluate on chronological future) to avoid lookahead data leakage in supply chain forecasting. The champion model automatically receives routing priority for all real-time inference APIs.
            </p>

            <div className="space-y-2 text-xs">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-900/40 border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-slate-400">Temporal Split Scheme:</span>
                <span className="font-mono font-semibold">Walk-Forward 5-Fold</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-900/40 border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-slate-400">Class Imbalance Handling:</span>
                <span className="font-mono font-semibold">Scale Pos Weight + Focal Loss</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-900/40 border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-slate-400">Explainability Engine:</span>
                <span className="font-mono font-semibold">Exact TreeSHAP</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Comprehensive Metrics Matrix Table ── */}
      <div className={`rounded-2xl p-5 ${cardCls}`}>
        <h3 className={`text-sm font-bold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Candidate Architecture Performance Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="text-left py-2.5 pr-4 font-semibold">Model Name</th>
                {metricKeys.map(k => (
                  <th key={k} className="text-right py-2.5 pr-4 font-semibold font-mono uppercase">
                    {k}
                  </th>
                ))}
                <th className="text-center py-2.5 font-semibold">Deployment Status</th>
              </tr>
            </thead>
            <tbody>
              {taskRows.map(r => {
                const isChamp = r.is_current_champion
                return (
                  <tr
                    key={r.model_name}
                    className={`border-b transition-colors
                      ${isDark
                        ? isChamp ? 'bg-emerald-500/5 border-slate-800' : 'border-slate-800/60 hover:bg-white/[0.02]'
                        : isChamp ? 'bg-emerald-50/60 border-slate-200' : 'border-slate-100 hover:bg-slate-50'
                      }
                    `}
                  >
                    <td className="py-3 pr-4 font-semibold flex items-center gap-2">
                      {isChamp ? <Trophy size={13} className="text-amber-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                      <span className={isChamp ? 'text-emerald-400 font-bold' : isDark ? 'text-slate-200' : 'text-slate-800'}>
                        {r.model_name}
                      </span>
                    </td>

                    {metricKeys.map(k => (
                      <td key={k} className={`py-3 pr-4 text-right font-mono-num ${isChamp ? 'font-bold text-emerald-400' : 'text-slate-400'}`}>
                        {r.metrics?.[k] !== undefined && typeof r.metrics[k] === 'number' ? r.metrics[k].toFixed(4) : (r.metrics?.[k] ?? '—')}
                      </td>
                    ))}

                    <td className="py-3 text-center">
                      {isChamp ? (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                          CHAMPION
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">BENCHMARK</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
