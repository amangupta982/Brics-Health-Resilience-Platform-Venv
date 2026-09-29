export default function StatusBadge({ level = 'INFO', size = 'default' }) {
  const normLevel = (level || 'INFO').toUpperCase()

  const dotColor = {
    CRITICAL: 'bg-rose-400',
    ERROR: 'bg-rose-400',
    HIGH: 'bg-orange-400',
    WARNING: 'bg-amber-400',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-emerald-400',
    SUCCESS: 'bg-emerald-400',
    STABLE: 'bg-emerald-400',
    WATCH: 'bg-amber-400',
    INFO: 'bg-sky-400',
  }[normLevel] || 'bg-slate-400'

  const sizeCls = size === 'large' ? 'text-xs px-2.5 py-1 badge-lg' : 'text-[10px] px-2 py-0.5'
  const badgeCls = `badge ${level || 'INFO'} ${normLevel} ${sizeCls} inline-flex items-center gap-1.5 font-mono font-bold tracking-wider rounded-md`

  return (
    <span className={badgeCls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${normLevel === 'CRITICAL' ? 'animate-pulse' : ''}`} />
      {level || 'INFO'}
    </span>
  )
}
