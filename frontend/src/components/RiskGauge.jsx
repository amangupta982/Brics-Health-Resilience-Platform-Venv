import { useTheme } from './ThemeContext.jsx'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react'

const RISK_ZONES = [
  { label: 'OPTIMAL', color: '#10b981', from: 0,    to: 0.30, sub: 'Normal Supply' },
  { label: 'WATCH',   color: '#eab308', from: 0.30, to: 0.60, sub: 'Moderate Risk' },
  { label: 'ELEVATED',color: '#f97316', from: 0.60, to: 0.85, sub: 'High Probability' },
  { label: 'CRITICAL',color: '#f43f5e', from: 0.85, to: 1.00, sub: 'Imminent Stockout' },
]

function getRiskMeta(prob) {
  if (prob >= 0.85) return { label: 'CRITICAL RISK', color: '#f43f5e', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: AlertOctagon }
  if (prob >= 0.60) return { label: 'HIGH RISK', color: '#f97316', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: AlertTriangle }
  if (prob >= 0.30) return { label: 'MODERATE RISK', color: '#eab308', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle }
  return { label: 'STABLE / LOW RISK', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ShieldCheck }
}

export default function RiskGauge({ probability = 0, size = 220 }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const safeProb = Math.max(0, Math.min(1, probability || 0))
  const cx = size / 2
  const cy = size * 0.62
  const r  = size * 0.38
  const strokeW = size * 0.065

  // Polar to XY coordinate conversion
  const polarToXY = (angleDeg, radius) => {
    const rad = ((angleDeg - 180) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  const describeArc = (startAngle, endAngle, radius) => {
    const s = polarToXY(startAngle, radius)
    const e = polarToXY(endAngle, radius)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const totalAngle = 180
  const needleAngle = safeProb * totalAngle // 0° to 180°
  const needlePoint = polarToXY(needleAngle, r * 0.72)
  const meta = getRiskMeta(safeProb)
  const Icon = meta.icon

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Background Track */}
        <path
          d={describeArc(0, 180, r)}
          fill="none"
          stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Color Zone Segments */}
        {RISK_ZONES.map((z) => (
          <path
            key={z.label}
            d={describeArc(z.from * 180 + 1, z.to * 180 - 1, r)}
            fill="none"
            stroke={z.color}
            strokeWidth={strokeW}
            strokeLinecap="butt"
            opacity={0.3}
          />
        ))}

        {/* Active Probability Arc */}
        <motion.path
          d={describeArc(0, safeProb * 180, r)}
          fill="none"
          stroke={meta.color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Tick Marks along the arc */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180
          const inner = polarToXY(angle, r - strokeW * 0.9)
          const outer = polarToXY(angle, r + strokeW * 0.9)
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1'}
              strokeWidth={1.5}
            />
          )
        })}

        {/* Needle Line */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needlePoint.x}
          y2={needlePoint.y}
          stroke={meta.color}
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Needle Hub Center */}
        <circle cx={cx} cy={cy} r={7} fill={meta.color} />
        <circle cx={cx} cy={cy} r={3} fill={isDark ? '#0e1626' : '#ffffff'} />

        {/* Zone Markers / Labels */}
        {[
          { angle: 18, label: '0%' },
          { angle: 90, label: '50%' },
          { angle: 162, label: '100%' },
        ].map(({ angle, label }) => {
          const pos = polarToXY(angle, r + strokeW * 1.5)
          return (
            <text
              key={label}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.05}
              fill={isDark ? '#64748b' : '#94a3b8'}
              fontWeight="600"
              fontFamily="JetBrains Mono"
            >
              {label}
            </text>
          )
        })}
      </svg>

      {/* Main Probability Readout */}
      <div className="text-center -mt-2">
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono-num" style={{ color: meta.color }}>
          {(safeProb * 100).toFixed(1)}%
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${meta.bg}`}>
            <Icon size={13} />
            {meta.label}
          </span>
        </div>
      </div>
    </div>
  )
}
