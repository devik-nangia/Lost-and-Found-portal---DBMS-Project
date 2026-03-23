import StatusBadge from './StatusBadge'

export default function ItemCard({ itemName, category, description, date, isMatched, type }) {
  const categoryIcons = {
    Books: '📚',
    Electronics: '💻',
    'ID Cards': '🪪',
    Accessories: '⌚',
    Clothing: '👕',
    Keys: '🔑',
    Other: '📦',
  }

  return (
    <div className="card p-5 flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{categoryIcons[category] || '📦'}</span>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-campus-dark truncate text-base group-hover:text-teal-700 transition-colors">
              {itemName}
            </h3>
            <span className="text-xs text-campus-muted font-display uppercase tracking-wider">{category}</span>
          </div>
        </div>
        <StatusBadge
          status={isMatched ? 'Matched' : 'Unmatched'}
          colorMap={{ Matched: 'green', Unmatched: 'gray' }}
        />
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 font-body leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <span className="text-xs text-campus-muted font-display">
          {type === 'lost' ? 'Lost' : 'Found'} on {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
