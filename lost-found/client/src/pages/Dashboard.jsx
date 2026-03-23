import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const [stats, setStats] = useState({ lost: 0, found: 0, pending: 0, matches: 0 })
  const [recentLost, setRecentLost] = useState([])
  const [recentFound, setRecentFound] = useState([])
  const [recentClaims, setRecentClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [lost, found, claims, matches] = await Promise.all([
          api.getLostItems(),
          api.getFoundItems(),
          api.getClaims(),
          api.getMatches(),
        ])
        setStats({
          lost: lost.length,
          found: found.length,
          pending: claims.filter(c => c.Status === 'Pending').length,
          matches: matches.length,
        })
        setRecentLost(lost.slice(0, 3))
        setRecentFound(found.slice(0, 3))
        setRecentClaims(claims.slice(0, 5))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />

  const statCards = [
    { label: 'Lost Items',     value: stats.lost,    icon: '⚑', color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
    { label: 'Found Items',    value: stats.found,   icon: '⊕', color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-100' },
    { label: 'Pending Claims', value: stats.pending, icon: '✦', color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
    { label: 'Matches Made',   value: stats.matches, icon: '◈', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ]

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-campus-dark mb-2 font-display">
          Dashboard
        </h1>
        <p className="text-campus-muted font-body text-lg">
          Campus Lost & Found overview — track items, claims, and matches at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map(s => (
          <div key={s.label} className={`card p-5 border ${s.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-2xl ${s.bg} w-10 h-10 rounded-lg flex items-center justify-center`}>{s.icon}</span>
            </div>
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-campus-muted font-display mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link to="/report-lost" className="btn-primary text-center py-3">
          ⚑ Report Lost Item
        </Link>
        <Link to="/report-found" className="btn-secondary text-center py-3">
          ⊕ Report Found Item
        </Link>
        <Link to="/claims/new" className="btn-secondary text-center py-3">
          ✦ File a Claim
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lost */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-campus-dark">Recent Lost Items</h2>
            <Link to="/browse" className="text-xs font-display text-teal-600 hover:text-teal-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentLost.map(item => (
              <div key={item.LostItemID} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-lg">⚑</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-display font-medium text-campus-dark truncate">{item.ItemName}</p>
                  <p className="text-xs text-campus-muted">{item.Category} · {new Date(item.DateLost).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <StatusBadge status={item.Is_Matched ? 'Matched' : 'Unmatched'} colorMap={{ Matched: 'green', Unmatched: 'gray' }} />
              </div>
            ))}
            {recentLost.length === 0 && <p className="text-sm text-campus-muted text-center py-4">No lost items yet</p>}
          </div>
        </div>

        {/* Recent Found */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-campus-dark">Recent Found Items</h2>
            <Link to="/browse" className="text-xs font-display text-teal-600 hover:text-teal-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentFound.map(item => (
              <div key={item.FoundItemID} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-lg">⊕</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-display font-medium text-campus-dark truncate">{item.ItemName}</p>
                  <p className="text-xs text-campus-muted">{item.Category} · {new Date(item.DateFound).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <StatusBadge status={item.Is_Matched ? 'Matched' : 'Unmatched'} colorMap={{ Matched: 'green', Unmatched: 'gray' }} />
              </div>
            ))}
            {recentFound.length === 0 && <p className="text-sm text-campus-muted text-center py-4">No found items yet</p>}
          </div>
        </div>

        {/* Recent Claims */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-campus-dark">Recent Claims</h2>
            <Link to="/claims" className="text-xs font-display text-teal-600 hover:text-teal-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentClaims.map(claim => (
              <div key={claim.ClaimID} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-lg">✦</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-display font-medium text-campus-dark truncate">{claim.UserName}</p>
                  <p className="text-xs text-campus-muted">{claim.FoundItemName} · {new Date(claim.ClaimDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <StatusBadge status={claim.Status} />
              </div>
            ))}
            {recentClaims.length === 0 && <p className="text-sm text-campus-muted text-center py-4">No claims yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-campus-muted font-display">Loading dashboard...</p>
      </div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center max-w-md">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="text-xl font-display font-semibold text-campus-dark mb-2">Connection Error</h2>
        <p className="text-campus-muted font-body mb-4">{message}</p>
        <p className="text-sm text-campus-muted font-body">Make sure the backend server is running on port 3001.</p>
      </div>
    </div>
  )
}
