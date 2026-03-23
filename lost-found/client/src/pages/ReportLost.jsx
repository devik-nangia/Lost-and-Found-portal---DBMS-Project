import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = ['Books', 'Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Keys', 'Other']

export default function ReportLost() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    ItemName: '',
    Category: '',
    Description: '',
    DateLost: new Date().toISOString().split('T')[0],
    UserName: '',
    Email: '',
    Phone: '',
    Department: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.createLostItem({
        ItemName: form.ItemName,
        Category: form.Category,
        Description: form.Description,
        DateLost: form.DateLost,
        UserName: form.UserName,
        Email: form.Email || undefined,
        Phone: form.Phone || undefined,
        Department: form.Department || undefined,
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
        <h1 className="page-title">Report Lost Item</h1>
        <p className="page-subtitle">Fill out the details below to report an item you've lost on campus.</p>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <p className="font-display font-medium text-emerald-800">Item reported successfully!</p>
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
              placeholder="e.g. Blue Notebook, MacBook Charger"
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
              placeholder="Describe any identifying features..."
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
              Date Lost <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="DateLost"
              value={form.DateLost}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="UserName"
                value={form.UserName}
                onChange={handleChange}
                required
                placeholder="e.g. Aarav Sharma"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
                Email <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                placeholder="e.g. aarav@university.edu"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
                Phone <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="Phone"
                value={form.Phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">
                Department <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                name="Department"
                value={form.Department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Submitting...' : '⚑ Report Lost Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
