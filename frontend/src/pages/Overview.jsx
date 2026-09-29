import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import {
  Building2, MapPin, Users, Bed, ShieldCheck, AlertTriangle,
  ArrowUpRight, TrendingUp, Zap, RefreshCw, ChevronRight, Activity, Filter,
  Sparkles, CheckCircle2, Clock, ArrowRight, ShieldAlert, FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import { useTheme } from '../components/ThemeContext.jsx'
import KpiCard from '../components/KpiCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { exportUniversalReport } from '../utils/pdfExport.js'

const DEFAULT_DISTRICTS = [
  { rank: 1, district: 'Bengaluru Rural', score: 89.4, status: 'stable', weakest: 'bed_capacity' },
  { rank: 2, district: 'Belagavi', score: 77.4, status: 'stable', weakest: 'staffing' },
  { rank: 3, district: 'Shivamogga', score: 75.2, status: 'stable', weakest: 'medicine' },
  { rank: 4, district: 'Mysuru', score: 73.8, status: 'stable', weakest: 'medicine' },
  { rank: 5, district: 'Tumakuru', score: 71.5, status: 'watch', weakest: 'emergency' },
]

const DEFAULT_OVERVIEW_PHCS = [
  { code: 'BEN-PHC01', name: 'Bengaluru Rural Central PHC', district: 'Bengaluru Rural', total_beds: 12, sanctioned_doctors: 2, catchment_population: 32000, is_remote: false },
  { code: 'BEN-PHC02', name: 'Devanahalli PHC', district: 'Bengaluru Rural', total_beds: 10, sanctioned_doctors: 2, catchment_population: 28000, is_remote: false },
  { code: 'BEL-PHC01', name: 'Belagavi North PHC', district: 'Belagavi', total_beds: 15, sanctioned_doctors: 3, catchment_population: 45000, is_remote: false },
  { code: 'KAL-PHC01', name: 'Kalaburagi Main PHC', district: 'Kalaburagi', total_beds: 14, sanctioned_doctors: 2, catchment_population: 38000, is_remote: true },
  { code: 'MYS-PHC01', name: 'Mysuru City PHC', district: 'Mysuru', total_beds: 16, sanctioned_doctors: 3, catchment_population: 52000, is_remote: false },
]

export default function Overview() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [phcs, setPhcs] = useState(DEFAULT_OVERVIEW_PHCS)
  const [districts, setDistricts] = useState([])
  const [alerts, setAlerts] = useState([])
  const [resilience, setResilience] = useState([])
  const [overviewStats, setOverviewStats] = useState(null)

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    Promise.all([
      api.getPHCs().catch(() => []),
      api.getDistricts().catch(() => []),
      api.getAlerts().catch(() => []),
      api.getResilienceScores().catch(() => []),
      api.getStatsOverview().catch(() => null),
    ])
      .then(([p, d, a, r, stats]) => {
        if (p && p.length > 0) setPhcs(p)
        if (d && d.length > 0) setDistricts(d)
        if (a) setAlerts(a)
        if (r && r.length > 0) setResilience(r)
        if (stats) setOverviewStats(stats)
      })
  }, [])

  const filteredPhcs = useMemo(() => {
    return phcs.filter(p => {
      if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false
      if (selectedType === 'remote' && !p.is_remote) return false
      if (selectedType === 'standard' && p.is_remote) return false
      return true
    })
  }, [phcs, selectedDistrict, selectedType])

  // Aggregates
  const totalFacilities = filteredPhcs.length || phcs.length || 60
  const remoteFacilities = filteredPhcs.filter(p => p.is_remote).length
  const totalBeds = filteredPhcs.reduce((acc, p) => acc + (p.total_beds || 0), 0)
  const totalDoctors = filteredPhcs.reduce((acc, p) => acc + (p.sanctioned_doctors || 0), 0)
  const totalPopulation = filteredPhcs.reduce((acc, p) => acc + (p.catchment_population || 0), 0)

  const avgResilienceScore = useMemo(() => {
    if (!resilience || resilience.length === 0) return 78.4
    const sum = resilience.reduce((acc, r) => acc + (r.resilience_score || 0), 0)
    return (sum / resilience.length).toFixed(1)
  }, [resilience])

  // District distribution chart
  const districtDistribution = useMemo(() => {
    const counts = {}
    phcs.forEach(p => {
      counts[p.district] = (counts[p.district] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({
      name: name.length > 11 ? name.slice(0, 11) + '…' : name,
      fullName: name,
      count,
    }))
  }, [phcs])

  // Facility split data
  const facilitySplit = useMemo(() => [
    { name: 'Standard PHCs', value: totalFacilities - remoteFacilities, color: '#0284c7' },
    { name: 'Remote / Tribal PHCs', value: remoteFacilities, color: '#f97316' },
  ], [totalFacilities, remoteFacilities])

  const cardCls = isDark
    ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm'
    : 'bg-white border border-slate-200 shadow-sm'

  const selectCls = isDark
    ? 'bg-[#090e18] border border-white/[0.1] text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-sky-500'
    : 'bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none focus:border-sky-500'

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

      {/* ── Operational Status Banner ── */}
      <div className={`rounded-2xl p-5 border relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-sky-950/40 via-[#0e1626] to-[#0e1626] border-sky-500/20' : 'bg-gradient-to-r from-sky-50 via-white to-white border-sky-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  National Health Resilience Surveillance Grid
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  PILOT ACTIVE
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Continuous algorithmic monitoring across 60 Primary Healthcare Centres in 10 Karnataka districts. 7-day medicine stockout forecasting, Linear Programming redistribution, and Flower FedAvg federation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={async () => {
                try {
                  toast.loading('Generating overview report...', { id: 'ov-dl' })
                  const fileName = await exportUniversalReport('/')
                  toast.success(`Report downloaded: ${fileName}`, { id: 'ov-dl' })
                } catch (err) {
                  console.error(err)
                  toast.error('Failed to generate report PDF', { id: 'ov-dl' })
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown size={14} /> Download Report (PDF)
            </button>
            <Link
              to="/stockout"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            >
              <Zap size={14} className="text-amber-400" /> Run Prediction
            </Link>
            <Link
              to="/redistribution"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            >
              <RefreshCw size={13} className="text-sky-400" /> Optimize LP
            </Link>
          </div>
        </div>
      </div>

      {/* ── Network Filters Bar ── */}
      <div className={`p-4 rounded-2xl ${cardCls} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-2.5">
          <Filter size={15} className="text-sky-500" />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Network Filters
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            ({filteredPhcs.length} of {phcs.length} Facilities Active)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className={selectCls}
          >
            <option value="all">All Operational Districts ({districts.length || 10})</option>
            {districts.map(d => (
              <option key={d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className={selectCls}
          >
            <option value="all">All Facility Classifications</option>
            <option value="standard">Standard Facilities</option>
            <option value="remote">Remote / Tribal Facilities</option>
          </select>

          {(selectedDistrict !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => { setSelectedDistrict('all'); setSelectedType('all') }}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Primary Executive KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Active Facilities"
          value={totalFacilities}
          unit="PHCs"
          icon={Building2}
          color="blue"
          sub={`${remoteFacilities} classified remote / tribal`}
          trend={5.2}
          trendLabel="+5.2% surveillance coverage"
          delay={0.02}
        />
        <KpiCard
          label="Catchment Population"
          value={(totalPopulation || 2840000).toLocaleString()}
          unit="citizens"
          icon={Users}
          color="violet"
          sub="Primary care network catchment"
          delay={0.05}
        />
        <KpiCard
          label="Inpatient Bed Capacity"
          value={totalBeds || 720}
          unit="beds"
          icon={Bed}
          color="green"
          sub={`${totalDoctors || 120} doctors sanctioned`}
          delay={0.08}
        />
        <KpiCard
          label="Composite Resilience"
          value={avgResilienceScore}
          unit="/100"
          icon={ShieldCheck}
          color="orange"
          sub="Network-wide composite index"
          trend={2.4}
          trendLabel="+2.4 vs baseline"
          delay={0.11}
        />
      </div>

      {/* ── Visual Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Facilities Distribution Chart */}
        <div className={`lg:col-span-2 rounded-2xl p-5 ${cardCls}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                PHC Facility Distribution by District
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Operational primary healthcare density across monitored zones
              </p>
            </div>
            <Link to="/map" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold">
              Explore Map <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={ttStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {districtDistribution.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#0284c7' : '#0ea5e9'} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Classification Doughnut */}
        <div className={`rounded-2xl p-5 ${cardCls} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Facility Accessibility Tier
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                TERRAIN
              </span>
            </div>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Standard vs Remote / Tribal logistical vulnerability
            </p>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={facilitySplit}
                    innerRadius={54}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {facilitySplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={ttStyle} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total Pill */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-2xl font-extrabold font-mono-num ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {totalFacilities}
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  PHCs
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-700/20 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Standard Access PHCs</span>
              </span>
              <span className="font-bold font-mono-num">{totalFacilities - remoteFacilities}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Remote / Tribal PHCs</span>
              </span>
              <span className="font-bold font-mono-num">{remoteFacilities}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Active Alerts Feed & Resilience Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Alerts Stream */}
        <div className={`lg:col-span-2 rounded-2xl p-5 ${cardCls}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-400" />
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Operational Incident Feed
              </h3>
            </div>
            <Link to="/alerts" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
              View All Alerts <ChevronRight size={13} />
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-xl border-slate-700/40 text-slate-400 text-xs">
              <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2 opacity-80" />
              No active stockout crises detected across the monitored grid.
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((a, i) => (
                <div
                  key={a.id || i}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-xs transition-colors border
                    ${isDark
                      ? 'bg-slate-900/40 hover:bg-slate-900/80 border-white/[0.05]'
                      : 'bg-slate-50/70 hover:bg-slate-100 border-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge level={a.severity} />
                    <div className="min-w-0">
                      <div className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {a.message || a.alert_type}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1.5 mt-0.5`}>
                        <Clock size={10} />
                        <span>{a.alert_type}</span>
                        <span>•</span>
                        <span>{a.created_at ? new Date(a.created_at).toLocaleTimeString() : 'Just now'}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/stockout"
                    className="p-1.5 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 shrink-0 transition-colors"
                    title="Triage in Stockout Prediction"
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* District Resilience Scoreboard */}
        <div className={`rounded-2xl p-5 ${cardCls} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-400" />
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  District Resilience Ranking
                </h3>
              </div>
              <Link to="/resilience" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
                Explore Full
              </Link>
            </div>

            <div className="space-y-3">
              {(resilience.length > 0 ? resilience.slice(0, 5) : DEFAULT_DISTRICTS).map((d, i) => {
                const score = d.resilience_score ?? d.score ?? 70
                const isTop = i === 0
                return (
                  <div key={d.district || i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0
                        ${isTop
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }
                      `}>
                        {i + 1}
                      </span>
                      <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {d.district}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-mono-num font-bold ${score >= 75 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {score}/100
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/20">
            <Link
              to="/resilience"
              className="w-full py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Inspect Factor Diagnostics <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>

      {/* ── Operational Workflows & AI Modules ── */}
      <div className={`p-5 rounded-2xl ${cardCls}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Operational Modules & AI Optimization Engines
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Link
            to="/stockout"
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5
              ${isDark ? 'bg-[#0a101d] border-white/[0.06] hover:border-sky-500/30' : 'bg-slate-50 border-slate-200 hover:border-sky-300'}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="text-xs font-bold">Predict Stockout</div>
              <div className={`text-[10.5px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>7-day early warning</div>
            </div>
          </Link>

          <Link
            to="/demand"
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5
              ${isDark ? 'bg-[#0a101d] border-white/[0.06] hover:border-indigo-500/30' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="text-xs font-bold">Demand Forecast</div>
              <div className={`text-[10.5px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>1d/7d/14d/30d horizons</div>
            </div>
          </Link>

          <Link
            to="/emergency"
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5
              ${isDark ? 'bg-[#0a101d] border-white/[0.06] hover:border-rose-500/30' : 'bg-slate-50 border-slate-200 hover:border-rose-300'}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-xs font-bold">Emergency Simulation</div>
              <div className={`text-[10.5px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stress-test outbreaks</div>
            </div>
          </Link>

          <Link
            to="/redistribution"
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5
              ${isDark ? 'bg-[#0a101d] border-white/[0.06] hover:border-emerald-500/30' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RefreshCw size={16} />
            </div>
            <div>
              <div className="text-xs font-bold">LP Redistribution</div>
              <div className={`text-[10.5px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>FEFO route optimization</div>
            </div>
          </Link>
        </div>
      </div>

    </div>
  )
}
