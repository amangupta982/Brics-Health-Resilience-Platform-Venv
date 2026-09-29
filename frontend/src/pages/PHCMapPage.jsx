import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Search, Filter, AlertTriangle, Users, Bed,
  Stethoscope, MapPin, ArrowRight, ShieldCheck, Zap, X
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import api from '../services/api.js'
import { useTheme } from '../components/ThemeContext.jsx'
import KpiCard from '../components/KpiCard.jsx'

// Dynamic map view repositioning
function ChangeView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

const DEFAULT_MAP_PHCS = [
  { code: 'BEN-PHC01', name: 'Bengaluru Rural Central PHC', district: 'Bengaluru Rural', lat: 13.23, lon: 77.71, total_beds: 12, sanctioned_doctors: 2, sanctioned_nurses: 4, catchment_population: 32000, is_remote: false },
  { code: 'BEN-PHC02', name: 'Devanahalli PHC', district: 'Bengaluru Rural', lat: 13.25, lon: 77.72, total_beds: 10, sanctioned_doctors: 2, sanctioned_nurses: 3, catchment_population: 28000, is_remote: false },
  { code: 'BEL-PHC01', name: 'Belagavi North PHC', district: 'Belagavi', lat: 15.86, lon: 74.50, total_beds: 15, sanctioned_doctors: 3, sanctioned_nurses: 5, catchment_population: 45000, is_remote: false },
  { code: 'KAL-PHC01', name: 'Kalaburagi Main PHC', district: 'Kalaburagi', lat: 17.33, lon: 76.83, total_beds: 14, sanctioned_doctors: 2, sanctioned_nurses: 4, catchment_population: 38000, is_remote: true },
  { code: 'MYS-PHC01', name: 'Mysuru City PHC', district: 'Mysuru', lat: 12.30, lon: 76.65, total_beds: 16, sanctioned_doctors: 3, sanctioned_nurses: 6, catchment_population: 52000, is_remote: false },
]

export default function PHCMapPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [phcs, setPhcs] = useState(DEFAULT_MAP_PHCS)
  const [districts, setDistricts] = useState([])

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhc, setSelectedPhc] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getPHCs().catch(() => []),
      api.getDistricts().catch(() => []),
    ])
      .then(([p, d]) => {
        if (p && p.length > 0) setPhcs(p)
        if (d && d.length > 0) setDistricts(d)
      })
  }, [])

  const filteredPhcs = useMemo(() => {
    return phcs.filter(p => {
      if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false
      if (selectedType === 'remote' && !p.is_remote) return false
      if (selectedType === 'standard' && p.is_remote) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchCode = p.code?.toLowerCase().includes(term)
        const matchName = p.name?.toLowerCase().includes(term)
        const matchDist = p.district?.toLowerCase().includes(term)
        if (!matchCode && !matchName && !matchDist) return false
      }
      return true
    })
  }, [phcs, selectedDistrict, selectedType, searchTerm])

  const remoteCount = useMemo(() => filteredPhcs.filter(p => p.is_remote).length, [filteredPhcs])
  const standardCount = useMemo(() => filteredPhcs.length - remoteCount, [filteredPhcs, remoteCount])
  const totalBeds = useMemo(() => filteredPhcs.reduce((a, b) => a + (b.total_beds || 0), 0), [filteredPhcs])

  // Center point
  const mapCenter = useMemo(() => {
    if (selectedPhc && selectedPhc.lat && selectedPhc.lon) {
      return [selectedPhc.lat, selectedPhc.lon]
    }
    if (filteredPhcs.length === 0) return [14.5, 76.2]
    const valid = filteredPhcs.filter(p => p.lat && p.lon)
    if (valid.length === 0) return [14.5, 76.2]
    const latSum = valid.reduce((a, b) => a + b.lat, 0)
    const lonSum = valid.reduce((a, b) => a + b.lon, 0)
    return [latSum / valid.length, lonSum / valid.length]
  }, [filteredPhcs, selectedPhc])

  const mapZoom = selectedPhc ? 11 : selectedDistrict !== 'all' ? 9 : 7

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const cardCls = isDark
    ? 'bg-[#0e1626] border border-white/[0.08] shadow-sm'
    : 'bg-white border border-slate-200 shadow-sm'

  const inputCls = isDark
    ? 'bg-[#090e18] border border-white/[0.1] text-slate-200 focus:border-sky-500'
    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-sky-500'

  return (
    <div className="space-y-5">

      {/* ── Top GIS Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Mappable Facilities"
          value={filteredPhcs.length}
          unit="PHCs"
          icon={Building2}
          color="blue"
          sub={`${standardCount} standard access facilities`}
          delay={0.02}
        />
        <KpiCard
          label="Remote / Tribal Centers"
          value={remoteCount}
          unit="facilities"
          icon={MapPin}
          color="orange"
          sub="Logistically vulnerable terrain"
          delay={0.05}
        />
        <KpiCard
          label="Inpatient Bed Resources"
          value={totalBeds}
          unit="beds"
          icon={Bed}
          color="green"
          sub="Active monitored capacity"
          delay={0.08}
        />
      </div>

      {/* ── Filter & Search Control Ribbon ── */}
      <div className={`p-4 rounded-2xl ${cardCls} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name, code, district..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl outline-none transition-colors ${inputCls}`}
            />
          </div>

          {/* District select */}
          <select
            value={selectedDistrict}
            onChange={e => {
              setSelectedDistrict(e.target.value)
              setSelectedPhc(null)
            }}
            className={`px-3 py-1.5 text-xs rounded-xl outline-none ${inputCls}`}
          >
            <option value="all">All Operational Districts ({districts.length || 10})</option>
            {districts.map(d => (
              <option key={d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-xl outline-none ${inputCls}`}
          >
            <option value="all">All Access Tiers</option>
            <option value="standard">Standard Access PHCs</option>
            <option value="remote">Remote / Tribal PHCs</option>
          </select>

          {(selectedDistrict !== 'all' || selectedType !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDistrict('all')
                setSelectedType('all')
                setSearchTerm('')
                setSelectedPhc(null)
              }}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Standard Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Remote / Tribal</span>
          </div>
        </div>
      </div>

      {/* ── Map Canvas & Floating Facility Inspector ── */}
      <div className="relative h-[580px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
          />

          {filteredPhcs.map((p) => {
            if (!p.lat || !p.lon) return null
            const isSelected = selectedPhc?.code === p.code
            const color = p.is_remote ? '#f97316' : '#0284c7'

            return (
              <CircleMarker
                key={p.code}
                center={[p.lat, p.lon]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.85,
                  color: isSelected ? '#ffffff' : color,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => setSelectedPhc(p),
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5 text-xs">
                    <div className="font-bold text-sky-400 text-sm">{p.name || p.code}</div>
                    <div className="text-slate-400 text-[11px]">{p.district} • Code: {p.code}</div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/40 text-[11px]">
                      <div>Beds: <strong className="text-white">{p.total_beds || '—'}</strong></div>
                      <div>Doctors: <strong className="text-white">{p.sanctioned_doctors || '—'}</strong></div>
                      <div className="col-span-2">Catchment: <strong className="text-white">{(p.catchment_population || 0).toLocaleString()}</strong></div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* Floating Facility Inspector Card */}
        <AnimatePresence>
          {selectedPhc && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`
                absolute top-4 right-4 z-[1000] w-80 rounded-2xl p-4 border backdrop-blur-md shadow-2xl
                ${isDark
                  ? 'bg-[#0e1626]/95 border-white/[0.12] text-slate-100'
                  : 'bg-white/95 border-slate-200 text-slate-900'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 pr-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${selectedPhc.is_remote ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                    {selectedPhc.is_remote ? 'REMOTE / TRIBAL' : 'STANDARD ACCESS'}
                  </span>
                  <h3 className="font-bold text-sm tracking-tight truncate mt-1">
                    {selectedPhc.name || selectedPhc.code}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {selectedPhc.code} • {selectedPhc.district}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPhc(null)}
                  className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/50 border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-[10px] text-slate-400">Inpatient Beds</div>
                  <div className="text-sm font-bold font-mono-num">{selectedPhc.total_beds || '—'}</div>
                </div>
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/50 border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-[10px] text-slate-400">Sanctioned Doctors</div>
                  <div className="text-sm font-bold font-mono-num">{selectedPhc.sanctioned_doctors || '—'}</div>
                </div>
                <div className={`col-span-2 p-2 rounded-xl border ${isDark ? 'bg-slate-900/50 border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-[10px] text-slate-400">Catchment Population</div>
                  <div className="text-sm font-bold font-mono-num">{(selectedPhc.catchment_population || 0).toLocaleString()} citizens</div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/stockout`}
                className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Zap size={13} />
                <span>Evaluate Stockout Risk</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
