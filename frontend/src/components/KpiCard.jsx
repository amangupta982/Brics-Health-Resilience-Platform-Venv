import { useTheme } from './ThemeContext.jsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function KpiCard({
  label,
  value,
  unit = '',
  sub,
  trend,
  trendLabel,
  color = 'blue',
  icon: Icon,
  delay = 0,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Refined clinical accent styling
  const colorMap = {
    blue: {
      accent: 'bg-sky-500',
      badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      lightBadgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      iconBg: isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600',
      glow: 'rgba(2, 132, 199, 0.15)',
    },
    green: {
      accent: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      lightBadgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      glow: 'rgba(16, 185, 129, 0.15)',
    },
    red: {
      accent: 'bg-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      lightBadgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600',
      glow: 'rgba(244, 63, 94, 0.15)',
    },
    orange: {
      accent: 'bg-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      lightBadgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
      glow: 'rgba(245, 158, 11, 0.15)',
    },
    violet: {
      accent: 'bg-indigo-500',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      lightBadgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
      glow: 'rgba(99, 102, 241, 0.15)',
    },
  }

  const c = colorMap[color] || colorMap.blue
  const isPositive = trend > 0
  const isNegative = trend < 0
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  const trendBadgeStyle = isPositive
    ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isNegative
      ? isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'
      : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className={`
        relative rounded-2xl p-5 overflow-hidden transition-all duration-200 group
        ${isDark
          ? 'bg-[#0e1626] border border-white/[0.08] hover:border-white/[0.14] shadow-sm'
          : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
        }
      `}
    >
      {/* Top Hairline Accent */}
      <div className={`absolute top-0 left-5 right-5 h-[2px] ${c.accent} opacity-80 rounded-full`} />

      {/* Header: Label & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${c.iconBg}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono-num ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {value ?? '—'}
        </span>
        {unit && (
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle / Description */}
      {sub && (
        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>
          {sub}
        </div>
      )}

      {/* Trend Indicator Pill */}
      {trendLabel !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-slate-700/20 flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${trendBadgeStyle}`}>
            <TrendIcon size={11} />
            <span>{trendLabel}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
