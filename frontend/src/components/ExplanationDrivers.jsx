import { useTheme } from './ThemeContext.jsx'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ExplanationDrivers({ topDrivers }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!topDrivers || topDrivers.length === 0) return null

  return (
    <div className={`
      rounded-2xl p-5 transition-all
      ${isDark ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm' : 'bg-white border border-slate-200 shadow-sm'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            SHAP Explainability Drivers
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Key factors driving this facility's risk determination
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-mono font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
          <Info size={11} className="text-sky-400" /> TreeSHAP
        </span>
      </div>

      <div className="space-y-3.5">
        {topDrivers.map((d, i) => {
          const isIncrease = d.direction === 'increases_risk'
          const pct = Math.min(100, Math.max(0, d.contribution_pct || 0))

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-white/[0.04]' : 'bg-slate-50/70 border-slate-100'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {d.factor}
                  </span>
                  <span className={`
                    inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
                    ${isIncrease
                      ? isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
                      : isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }
                  `}>
                    {isIncrease ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isIncrease ? 'Elevates Risk' : 'Mitigates Risk'}
                  </span>
                </div>
                <span className={`text-xs font-bold font-mono-num ${isIncrease ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isIncrease ? '+' : '-'}{pct.toFixed(1)}%
                </span>
              </div>

              {/* Progress Attribution Bar */}
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200/80'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${isIncrease ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
