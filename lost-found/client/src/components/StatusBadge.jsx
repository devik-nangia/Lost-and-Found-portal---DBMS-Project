export default function StatusBadge({ status, colorMap }) {
  const defaultColors = {
    Pending:   'amber',
    Verified:  'green',
    Rejected:  'red',
    Matched:   'green',
    Unmatched: 'gray',
  }

  const colors = { ...defaultColors, ...colorMap }
  const color = colors[status] || 'gray'

  const colorClasses = {
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    green:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    red:     'bg-red-50 text-red-700 border-red-200',
    gray:    'bg-gray-50 text-gray-500 border-gray-200',
    teal:    'bg-teal-50 text-teal-700 border-teal-200',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-medium border ${colorClasses[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        color === 'amber' ? 'bg-amber-500' :
        color === 'green' ? 'bg-emerald-500' :
        color === 'red' ? 'bg-red-500' :
        color === 'teal' ? 'bg-teal-500' :
        'bg-gray-400'
      }`} />
      {status}
    </span>
  )
}
