import { useTheme } from './ThemeContext.jsx'
import { Trophy, CheckCircle, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MODEL_PALETTE = {
  xgboost: '#0284c7',
  lightgbm: '#6366f1',
  lstm: '#10b981',
  naive_lag1: '#64748b',
  moving_average_7d: '#94a3b8',
  logistic_regression: '#f97316',
  baseline: '#475569',
}

export default function ModelComparisonCard({ allModelOutputs, selectedModel, selectionReason }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!allModelOutputs || allModelOutputs.length === 0) return null

  const metricKeys = Object.keys(allModelOutputs[0]?.metrics || {}).filter(
    k => typeof allModelOutputs[0].metrics[k] !== 'object' && k !== 'model'
  )

  const chartData = allModelOutputs
    .filter(m => m.prediction !== null && m.prediction !== undefined)
    .map(m => ({
      name: m.model,
      prediction: +(m.prediction || 0).toFixed(3),
      isChamp: m.model === selectedModel,
    }))

  const ttStyle = {
    background: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: 12,
    fontSize: 12,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
    color: isDark ? '#f8fafc' : '#0f172a',
  }

  return (
    <div className={`
      rounded-2xl p-5 transition-all
      ${isDark ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm' : 'bg-white border border-slate-200 shadow-sm'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Candidate Model Ensemble Audit
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Side-by-side inference outputs across evaluated architectures
          </p>
        </div>
        {selectedModel && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            <Trophy size={12} className="text-amber-400" />
            <span>Champion: {selectedModel}</span>
          </div>
        )}
      </div>

      {/* Prediction Bar Chart */}
      {chartData.length > 0 && (
        <div className="mb-4 pt-2">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
              <YAxis stroke="#64748b" fontSize={11} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} />
              <Tooltip contentStyle={ttStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="prediction" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.isChamp ? '#10b981' : (MODEL_PALETTE[d.name] || '#0284c7')}
                    fillOpacity={d.isChamp ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Model Benchmark Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-2 pr-4 font-semibold">Model Candidate</th>
              <th className="text-right py-2 pr-4 font-semibold">Prediction</th>
              {metricKeys.map(k => (
                <th key={k} className="text-right py-2 pr-3 font-semibold uppercase font-mono">
                  {k}
                </th>
              ))}
              <th className="text-center py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {allModelOutputs.map(m => {
              const isChamp = m.model === selectedModel
              return (
                <tr
                  key={m.model}
                  className={`border-b transition-colors
                    ${isDark ? 'border-slate-800/60' : 'border-slate-100'}
                    ${isChamp
                      ? isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/60'
                      : isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <td className="py-2.5 pr-4 font-medium flex items-center gap-1.5">
                    {isChamp ? (
                      <Trophy size={13} className="text-amber-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    )}
                    <span className={isChamp ? 'font-bold text-emerald-400' : isDark ? 'text-slate-200' : 'text-slate-800'}>
                      {m.model}
                    </span>
                  </td>

                  <td className={`py-2.5 pr-4 text-right font-mono-num font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {m.prediction !== null && m.prediction !== undefined ? m.prediction : <span className="text-slate-400 font-normal">offline</span>}
                  </td>

                  {metricKeys.map(k => (
                    <td key={k} className="py-2.5 pr-3 text-right font-mono-num text-slate-400">
                      {m.metrics?.[k] !== undefined && typeof m.metrics[k] === 'number' ? m.metrics[k].toFixed(4) : (m.metrics?.[k] ?? '—')}
                    </td>
                  ))}

                  <td className="py-2.5 text-center">
                    {isChamp ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        CHAMPION
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">CANDIDATE</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectionReason && (
        <div className={`mt-3.5 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2 border ${isDark ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/15' : 'bg-emerald-50/80 text-emerald-800 border-emerald-200'}`}>
          <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <span>{selectionReason}</span>
        </div>
      )}
    </div>
  )
}
