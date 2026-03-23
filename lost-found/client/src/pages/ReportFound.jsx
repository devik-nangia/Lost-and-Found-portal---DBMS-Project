import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = ['Books', 'Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Keys', 'Other']

export default function ReportFound() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    ItemName: '',
    Category: '',
    Description: '',
    DateFound: new Date().toISOString().split('T')[0],
    SubmittedByName: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.createFoundItem({
        ItemName: form.ItemName,
        Category: form.Category,
        Description: form.Description,
        DateFound: form.DateFound,
        SubmittedByName: form.SubmittedByName,
      })
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-display font-medium rounded-full border border-teal-200">Admin Only</span>
        </div>
        <h1 className="page-title">Report Found Item</h1>
        <p className="page-subtitle">Submit an item that has been found on campus.</p>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <p className="font-display font-medium text-emerald-800">Item submitted successfully!</p>
              <p className="text-sm text-emerald-600">Redirecting to dashboard...</p>
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
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              name="ItemName"
              value={form.ItemName}
              onChange={handleChange}
              required
              placeholder="e.g. Water Bottle, Laptop Charger"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select name="Category" value={form.Category} onChange={handleChange} required className="select-field">
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">Description</label>
            <textarea
              name="Description"
              value={form.Description}
              onChange={handleChange}
              rows={3}
              placeholder="Where was it found? Any distinguishing marks?"
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
                Date Found <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="DateFound"
                value={form.DateFound}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
                Submitted By <span className="text-red-500">*</span>
              </label>
              <input
                name="SubmittedByName"
                value={form.SubmittedByName}
                onChange={handleChange}
                required
                placeholder="e.g. Dr. Kapoor"
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Submitting...' : '⊕ Submit Found Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
