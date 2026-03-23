import { useState, useEffect } from 'react'
import { api } from '../api'
import ItemCard from '../components/ItemCard'

const CATEGORIES = ['All', 'Books', 'Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Keys', 'Other']

export default function Browse() {
  const [activeTab, setActiveTab] = useState('lost')
  const [category, setCategory] = useState('All')
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [lost, found] = await Promise.all([
          api.getLostItems(),
          api.getFoundItems(),
        ])
        setLostItems(lost)
        setFoundItems(found)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const items = activeTab === 'lost' ? lostItems : foundItems
  const filtered = category === 'All' ? items : items.filter(i => i.Category === category)

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 text-center">
          <p className="text-red-600 font-display">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Browse Items</h1>
      <p className="page-subtitle">View all lost and found items reported on campus.</p>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setActiveTab('lost'); setCategory('All') }}
          className={`px-5 py-2.5 rounded-lg text-sm font-display font-medium transition-all duration-200
            ${activeTab === 'lost'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          ⚑ Lost Items ({lostItems.length})
        </button>
        <button
          onClick={() => { setActiveTab('found'); setCategory('All') }}
          className={`px-5 py-2.5 rounded-lg text-sm font-display font-medium transition-all duration-200
            ${activeTab === 'found'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          ⊕ Found Items ({foundItems.length})
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all duration-200 border
              ${category === c
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-campus-muted font-display">
            No {activeTab} items found{category !== 'All' && ` in "${category}"`}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <ItemCard
              key={activeTab === 'lost' ? item.LostItemID : item.FoundItemID}
              itemName={item.ItemName}
              category={item.Category}
              description={item.Description}
              date={activeTab === 'lost' ? item.DateLost : item.DateFound}
              isMatched={item.Is_Matched}
              type={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  )
}
