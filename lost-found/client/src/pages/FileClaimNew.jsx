import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function FileClaimNew() {
  const navigate = useNavigate()
  const [foundItems, setFoundItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    UserName: '',
    FoundItemID: '',
    ClaimDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    api.getFoundItems('')
      .then(setFoundItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.createClaim({
        ClaimDate: form.ClaimDate,
        UserName: form.UserName,
        FoundItemID: parseInt(form.FoundItemID),
      })
      setSuccess(true)
      setTimeout(() => navigate('/claims'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title">File a Claim</h1>
        <p className="page-subtitle">Claim a found item that belongs to you.</p>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <p className="font-display font-medium text-emerald-800">Claim filed successfully!</p>
              <p className="text-sm text-emerald-600">Redirecting to claims list...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-display">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
              Found Item <span className="text-red-500">*</span>
            </label>
            <select name="FoundItemID" value={form.FoundItemID} onChange={handleChange} required className="select-field">
              <option value="">Select a found item to claim</option>
              {foundItems.map(fi => (
                <option key={fi.FoundItemID} value={fi.FoundItemID}>
                  {fi.ItemName} ({fi.Category}) — Found {new Date(fi.DateFound).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </option>
              ))}
            </select>
            {foundItems.length === 0 && (
              <p className="text-xs text-amber-600 mt-1 font-display">No unmatched found items available.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="UserName"
              value={form.UserName}
              onChange={handleChange}
              required
              placeholder="e.g. Priya Patel"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
              Claim Date
            </label>
            <input
              type="date"
              name="ClaimDate"
              value={form.ClaimDate}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Submitting...' : '✦ File Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
