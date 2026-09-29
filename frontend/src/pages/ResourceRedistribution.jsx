import { useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  RefreshCw, Package, Truck, ArrowRight, ShieldCheck, Clock, Loader2,
  CheckCircle2, AlertTriangle, MapPin, Check, FileDown, FileText
} from 'lucide-react'
import { useTheme } from '../components/ThemeContext.jsx'
import api from '../services/api.js'
import KpiCard from '../components/KpiCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { exportUniversalReport } from '../utils/pdfExport.js'

export default function ResourceRedistribution() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [approvedOrders, setApprovedOrders] = useState({})

  const runOptimization = async () => {
    setLoading(true)
    setResult(null)
    setApprovedOrders({})
    try {
      const res = await api.optimizeRedistribution()
      setResult(res)
      toast.success(`LP Solved: ${res.total_transfer_orders} optimal transfer orders calculated.`)
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Optimization failed. Check backend logs.')
    } finally {
      setLoading(false)
    }
  }

  const toggleApprove = (idx) => {
    setApprovedOrders(prev => {
      const next = { ...prev, [idx]: !prev[idx] }
      if (next[idx]) {
        toast.success(`Dispatch Order #${idx + 1} marked approved for transit.`)
      }
      return next
    })
  }

  const approveAll = () => {
    if (!result?.transfers) return
    const all = {}
    result.transfers.forEach((_, i) => { all[i] = true })
    setApprovedOrders(all)
    toast.success(`All ${result.transfers.length} dispatch orders approved for cross-district routing.`)
  }

  const cardCls = isDark
    ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm'
    : 'bg-white border border-slate-200 shadow-sm'

  return (
    <div className="space-y-6">

      {/* ── LP Solver Explanation & Trigger Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 ${cardCls}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Constrained Linear Programming Redistribution Engine
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isDark ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                Google OR-Tools LP
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
              Formulates and solves a multi-district transportation Linear Program: minimizes inter-facility transport mileage while penalizing deficit facilities facing high stockout probability. Prioritizes First-Expiry-First-Out (FEFO) medicine batches to eliminate wastage before expiration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={runOptimization}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {loading ? 'Solving Linear Program...' : 'Solve LP Optimization'}
            </button>

            {result && (
              <button
                onClick={async () => {
                  try {
                    toast.loading('Generating redistribution report...', { id: 'rd-dl' })
                    const fileName = await exportUniversalReport('/redistribution')
                    toast.success(`Dossier downloaded: ${fileName}`, { id: 'rd-dl' })
                  } catch (err) {
                    console.error(err)
                    toast.error('Failed to generate report PDF', { id: 'rd-dl' })
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/90 hover:bg-slate-700/90 border-white/10 text-white hover:border-sky-400/50'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                }`}
              >
                <FileDown size={15} className="text-sky-400" />
                <span>Download Report (PDF)</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Optimization Results ── */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Status Banner with PDF Action */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
            isDark
              ? 'bg-sky-500/10 border-sky-500/25 text-white'
              : 'bg-sky-50 border-sky-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-sky-400 tracking-tight uppercase font-mono">
                    Redistribution Dispatch Order Ready
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Solved
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {result.total_transfer_orders} optimal transfer routes computed. Download the official transport order dossier as a PDF.
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  toast.loading('Generating redistribution report...', { id: 'rd-dl' })
                  const fileName = await exportUniversalReport('/redistribution')
                  toast.success(`Dossier downloaded: ${fileName}`, { id: 'rd-dl' })
                } catch (err) {
                  console.error(err)
                  toast.error('Failed to generate report PDF', { id: 'rd-dl' })
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer self-start sm:self-auto"
            >
              <FileDown size={15} />
              <span>Download Report as PDF</span>
            </button>
          </div>
          {/* Result KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Optimal Transfer Routes"
              value={result.total_transfer_orders}
              unit="dispatch routes"
              icon={Truck}
              color="blue"
              sub={`Computed as of ${result.as_of_date || 'Today'}`}
              delay={0.02}
            />
            <KpiCard
              label="Total Reallocated Units"
              value={result.total_units_redistributed}
              unit="units"
              icon={Package}
              color="violet"
              sub="Zero emergency procurement expenditure"
              delay={0.05}
            />
            <KpiCard
              label="At-Risk PHCs Defended"
              value={result.at_risk_phcs_addressed}
              unit="facilities"
              icon={ShieldCheck}
              color="green"
              sub="Stockout averted within 72 hours"
              delay={0.08}
            />
          </div>

          {/* Transfer Orders Table & Dispatch Controls */}
          <div className={`rounded-2xl p-5 ${cardCls}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Recommended Cross-District Dispatch Orders
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Authorized inter-facility transfers generated by the LP optimizer
                </p>
              </div>

              {result.transfers.length > 0 && (
                <button
                  onClick={approveAll}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 self-start ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                >
                  <Check size={13} />
                  <span>Approve All Orders</span>
                </button>
              )}
            </div>

            {result.transfers.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl border-slate-700/40 text-slate-400 text-xs">
                <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2" />
                All facilities currently hold sufficient inventory buffers. No emergency transfers required.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="text-left py-2.5 pr-4 font-semibold">Formulary</th>
                      <th className="text-left py-2.5 pr-4 font-semibold">Donor Facility</th>
                      <th className="text-center py-2.5 px-3 font-semibold">Route</th>
                      <th className="text-left py-2.5 pr-4 font-semibold">Recipient Facility</th>
                      <th className="text-right py-2.5 pr-4 font-semibold">Transfer Volume</th>
                      <th className="text-right py-2.5 pr-4 font-semibold">Distance</th>
                      <th className="text-right py-2.5 pr-4 font-semibold">Recipient Risk</th>
                      <th className="text-center py-2.5 pr-4 font-semibold">Batch Expiry</th>
                      <th className="text-center py-2.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.transfers.map((t, i) => {
                      const isApproved = approvedOrders[i]
                      return (
                        <tr
                          key={i}
                          className={`border-b transition-colors
                            ${isDark
                              ? isApproved ? 'bg-emerald-500/5 border-slate-800' : 'border-slate-800/60 hover:bg-white/[0.02]'
                              : isApproved ? 'bg-emerald-50/60 border-slate-200' : 'border-slate-100 hover:bg-slate-50'
                            }
                          `}
                        >
                          <td className="py-3 pr-4 font-bold text-sky-400">
                            {t.medicine}
                          </td>

                          <td className="py-3 pr-4">
                            <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.from_phc}</div>
                            <div className="text-[10px] text-slate-400">{t.from_district}</div>
                          </td>

                          <td className="py-3 px-3 text-center text-sky-400 font-bold">
                            <ArrowRight size={14} className="inline opacity-80" />
                          </td>

                          <td className="py-3 pr-4">
                            <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t.to_phc}</div>
                            <div className="text-[10px] text-slate-400">{t.to_district}</div>
                          </td>

                          <td className={`py-3 pr-4 text-right font-extrabold font-mono-num ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t.quantity} units
                          </td>

                          <td className="py-3 pr-4 text-right font-mono-num text-slate-400">
                            {t.distance_km} km
                          </td>

                          <td className="py-3 pr-4 text-right">
                            <StatusBadge level={t.recipient_risk_score > 0.7 ? 'CRITICAL' : t.recipient_risk_score > 0.5 ? 'HIGH' : 'MEDIUM'} />
                          </td>

                          <td className="py-3 pr-4 text-center">
                            {t.fefo_priority ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono">
                                <Clock size={10} /> FEFO Expiring
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px] font-mono">Standard</span>
                            )}
                          </td>

                          <td className="py-3 text-center">
                            <button
                              onClick={() => toggleApprove(i)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border
                                ${isApproved
                                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                                  : isDark
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                }
                              `}
                            >
                              {isApproved ? 'Approved ✓' : 'Approve'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  )
}
