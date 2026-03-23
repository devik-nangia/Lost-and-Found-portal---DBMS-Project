import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import ClaimCard from '../components/ClaimCard'

export default function Claims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    api.getClaims()
      .then(setClaims)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter === 'All' ? claims : claims.filter(c => c.Status === statusFilter)

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
      <div className="flex items-center justify-between mb-2">
        <h1 className="page-title">Claims</h1>
        <Link to="/claims/new" className="btn-primary">
          ✦ File a Claim
        </Link>
      </div>
      <p className="page-subtitle">All claims filed for found items.</p>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Pending', 'Verified', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all duration-200 border
              ${statusFilter === s
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}
          >
            {s} {s !== 'All' && `(${claims.filter(c => s === 'All' || c.Status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-campus-muted font-display">No claims found{statusFilter !== 'All' && ` with status "${statusFilter}"`}.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Found Item</th>
                  <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Resolved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(claim => (
                  <ClaimCard key={claim.ClaimID} claim={claim} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
