import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts'
import { ShieldCheck, Award, AlertTriangle, Activity, Info, BarChart2, CheckCircle2, ChevronRight } from 'lucide-react'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import KpiCard from '../components/KpiCard.jsx'

const DEFAULT_RESILIENCE_SCORES = [
  { district: 'Bengaluru Rural', resilience_score: 89.4, medicine_availability: 92.5, bed_capacity: 86.0, staffing_adequacy: 88.0, emergency_readiness: 91.0, weakest_factor: 'bed_capacity' },
  { district: 'Belagavi', resilience_score: 77.4, medicine_availability: 78.0, bed_capacity: 76.0, staffing_adequacy: 75.0, emergency_readiness: 81.0, weakest_factor: 'staffing_adequacy' },
  { district: 'Shivamogga', resilience_score: 75.2, medicine_availability: 74.0, bed_capacity: 75.0, staffing_adequacy: 77.0, emergency_readiness: 75.0, weakest_factor: 'medicine_availability' },
  { district: 'Mysuru', resilience_score: 73.8, medicine_availability: 72.0, bed_capacity: 74.0, staffing_adequacy: 76.0, emergency_readiness: 73.0, weakest_factor: 'medicine_availability' },
  { district: 'Tumakuru', resilience_score: 71.5, medicine_availability: 70.0, bed_capacity: 72.0, staffing_adequacy: 73.0, emergency_readiness: 71.0, weakest_factor: 'medicine_availability' },
]

export default function DistrictResilience() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [scores, setScores] = useState(DEFAULT_RESILIENCE_SCORES)
  const [selected, setSelected] = useState(DEFAULT_RESILIENCE_SCORES[0])

  useEffect(() => {
    api.getResilienceScores()
      .then(data => {
        if (data && data.length > 0) {
          setScores(data)
          setSelected(data[0])
        }
      })
      .catch(() => {})
  }, [])

  const radarData = selected ? [
    { factor: 'Medicine Buffers', value: selected.medicine_availability, fullMark: 100 },
    { factor: 'Bed Capacity', value: selected.bed_capacity, fullMark: 100 },
    { factor: 'Staffing Coverage', value: selected.staffing_adequacy, fullMark: 100 },
    { factor: 'Emergency Protocol', value: selected.emergency_readiness, fullMark: 100 },
  ] : []

  const barData = scores.map(s => ({
    name: s.district.length > 13 ? s.district.slice(0, 13) + '…' : s.district,
    fullName: s.district,
    score: s.resilience_score,
  }))

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

      {/* ── District Ranking & Radar Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* District Ranking Horizontal Bar Chart */}
        <div className={`lg:col-span-6 rounded-2xl p-5 ${cardCls}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              District Resilience Leaderboard (0–100)
            </h3>
            <span className="text-[11px] text-sky-400 font-medium">Click bar to inspect</span>
          </div>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Composite multi-factor index of inventory, clinical capacity, staffing, and surge posture
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" width={110} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={ttStyle} />
                <Bar
                  dataKey="score"
                  radius={[0, 6, 6, 0]}
                  cursor="pointer"
                  onClick={(data) => {
                    const match = scores.find(s => s.district === data.fullName || s.district.startsWith(data.name.replace('…', '')))
                    if (match) setSelected(match)
                  }}
                >
                  {barData.map((d, i) => {
                    const isSelected = selected && (selected.district === d.fullName)
                    return (
                      <Cell
                        key={i}
                        fill={isSelected ? '#0284c7' : '#64748b'}
                        fillOpacity={isSelected ? 1 : 0.45}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart & Diagnostics for Selected District */}
        <div className={`lg:col-span-6 rounded-2xl p-5 ${cardCls} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                  Target Inspection
                </span>
                <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selected?.district || 'Select a District'}
                </h3>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-extrabold font-mono-num ${selected?.resilience_score >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selected?.resilience_score}/100
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Resilience Index</div>
              </div>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="factor" stroke="#64748b" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#0284c7"
                    fill="#0284c7"
                    fillOpacity={0.4}
                  />
                  <Tooltip contentStyle={ttStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weakest Factor Diagnostics */}
          {selected && (
            <div className={`mt-3 p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/40 border-white/[0.04]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-400">Bottleneck Factor:</span>
                <span className="text-xs font-bold text-amber-400 capitalize font-mono">
                  {selected.weakest_factor?.replace('_', ' ')}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Operational recommendation: Deploy targeted LP medicine redistribution and prioritize staffing rosters for this district's remote tier PHCs.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
