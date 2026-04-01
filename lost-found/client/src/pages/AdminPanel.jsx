import { useState, useEffect } from 'react'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'

const ADMIN_PASSWORD = 'admin123'

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const [claims, setClaims] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [admins, setAdmins] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)

  // Match form
  const [matchForm, setMatchForm] = useState({ LostItemID: '', FoundItemID: '' })
  const [selectedAdmin, setSelectedAdmin] = useState('')

  useEffect(() => {
    if (authenticated) fetchAll()
  }, [authenticated])

  async function fetchAll() {
    try {
      const [c, li, fi, a, m] = await Promise.all([
        api.getClaims(),
        api.getLostItems('?is_matched=0'),
        api.getFoundItems(''),
        api.getAdmins(),
        api.getMatches(),
      ])
      setClaims(c)
      setLostItems(li)
      setFoundItems(fi)
      setAdmins(a)
      setMatches(m)
      if (a.length > 0 && !selectedAdmin) setSelectedAdmin(a[0].AdminID.toString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg, isError = false) => {
    setActionMsg({ text: msg, isError })
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleClaimAction = async (claimId, status) => {
    try {
      await api.patchClaimStatus(claimId, {
        Status: status,
        AdminID: parseInt(selectedAdmin),
      })
      showMessage(`Claim #${claimId} ${status.toLowerCase()}`)
      fetchAll()
    } catch (err) {
      showMessage(err.message, true)
    }
  }

  const handleMatch = async (e) => {
    e.preventDefault()
    try {
      await api.createMatch({
        LostItemID: parseInt(matchForm.LostItemID),
        FoundItemID: parseInt(matchForm.FoundItemID),
      })
      showMessage('Match created successfully!')
      setMatchForm({ LostItemID: '', FoundItemID: '' })
      fetchAll()
    } catch (err) {
      showMessage(err.message, true)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  // ---------- PASSWORD GATE ----------
  if (!authenticated) {
    return (
      <div className="page-container flex items-center justify-center min-h-[70vh]">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-campus-dark mb-2">Admin Access</h1>
          <p className="text-sm text-campus-muted font-body mb-6">Enter the admin password to continue.</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
              placeholder="Enter password"
              className={`input-field text-center ${passwordError ? 'border-red-400 focus:ring-red-400' : ''}`}
              autoFocus
            />
            {passwordError && (
              <p className="text-sm text-red-600 font-display">Incorrect password. Please try again.</p>
            )}
            <button type="submit" className="btn-primary w-full py-2.5">
              Unlock Admin Panel
            </button>
          </form>

          <p className="text-xs text-campus-muted mt-4 font-body">
            Hint: the default password is <code className="bg-gray-100 px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    )
  }

  // ---------- LOADING / ERROR ----------
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

  const pendingClaims = claims.filter(c => c.Status === 'Pending')

  // ---------- MAIN PANEL ----------
  return (
    <div className="page-container">
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-display font-medium rounded-full border border-teal-200">Admin Panel</span>
        <button
          onClick={() => { setAuthenticated(false); setPasswordInput('') }}
          className="px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-display font-medium rounded-full border border-red-200 hover:bg-red-100 transition-colors"
        >
          🔓 Lock
        </button>
      </div>
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">Manage claims and create item matches.</p>

      {/* Notification */}
      {actionMsg && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 transition-all ${
          actionMsg.isError
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <span className="text-xl">{actionMsg.isError ? '✗' : '✓'}</span>
          <p className="font-display text-sm font-medium">{actionMsg.text}</p>
        </div>
      )}

      {/* Acting As Admin */}
      <div className="card p-4 mb-6 flex items-center gap-4 bg-gray-50">
        <span className="text-sm font-display font-medium text-campus-dark">Acting as:</span>
        <select
          value={selectedAdmin}
          onChange={(e) => setSelectedAdmin(e.target.value)}
          className="select-field w-auto"
        >
          {admins.map(a => (
            <option key={a.AdminID} value={a.AdminID}>{a.Name}</option>
          ))}
        </select>
      </div>

      {/* --- Claims Management --- */}
      <section className="mb-10">
        <h2 className="text-xl font-display font-semibold text-campus-dark mb-4">
          Pending Claims ({pendingClaims.length})
        </h2>

        {pendingClaims.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-campus-muted font-display">All claims have been resolved.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map(claim => (
              <div key={claim.ClaimID} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 text-lg">✦</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-medium text-campus-dark">
                      Claim #{claim.ClaimID} — <span className="text-teal-700">{claim.UserName}</span>
                    </p>
                    <p className="text-sm text-campus-muted font-body">
                      Claims "{claim.FoundItemName}" · Filed {new Date(claim.ClaimDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={claim.Status} />
                  <button
                    onClick={() => handleClaimAction(claim.ClaimID, 'Verified')}
                    className="btn-success text-xs"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleClaimAction(claim.ClaimID, 'Rejected')}
                    className="btn-danger text-xs"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All claims table */}
        {claims.filter(c => c.Status !== 'Pending').length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-display font-semibold text-campus-muted uppercase tracking-wider mb-3">Resolved Claims</h3>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-display font-semibold text-campus-muted uppercase tracking-wider">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {claims.filter(c => c.Status !== 'Pending').map(claim => (
                      <tr key={claim.ClaimID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-display font-medium">#{claim.ClaimID}</td>
                        <td className="px-4 py-3 text-sm font-body">{claim.UserName}</td>
                        <td className="px-4 py-3 text-sm font-body">{claim.FoundItemName}</td>
                        <td className="px-4 py-3"><StatusBadge status={claim.Status} /></td>
                        <td className="px-4 py-3 text-sm font-body text-campus-muted">{claim.AdminName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* --- Match Creation --- */}
      <section className="mb-10">
        <h2 className="text-xl font-display font-semibold text-campus-dark mb-4">Create a Match</h2>
        <div className="card p-6">
          <p className="text-sm text-campus-muted font-body mb-4">
            Link a lost item report with a found item to create a match. Both items will be marked as matched.
          </p>
          <form onSubmit={handleMatch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">Lost Item</label>
              <select
                value={matchForm.LostItemID}
                onChange={e => setMatchForm(prev => ({ ...prev, LostItemID: e.target.value }))}
                required
                className="select-field"
              >
                <option value="">Select lost item</option>
                {lostItems.map(li => (
                  <option key={li.LostItemID} value={li.LostItemID}>
                    {li.ItemName} ({li.Category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-display font-medium text-campus-dark mb-1.5">Found Item</label>
              <select
                value={matchForm.FoundItemID}
                onChange={e => setMatchForm(prev => ({ ...prev, FoundItemID: e.target.value }))}
                required
                className="select-field"
              >
                <option value="">Select found item</option>
                {foundItems.map(fi => (
                  <option key={fi.FoundItemID} value={fi.FoundItemID}>
                    {fi.ItemName} ({fi.Category})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary py-2.5">
              ◈ Create Match
            </button>
          </form>
        </div>
      </section>

      {/* --- Existing Matches --- */}
      <section>
        <h2 className="text-xl font-display font-semibold text-campus-dark mb-4">
          Existing Matches ({matches.length})
        </h2>
        {matches.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-2">🔗</p>
            <p className="text-campus-muted font-display">No matches created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m, i) => (
              <div key={i} className="card p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600">◈</span>
                </div>
                <div>
                  <p className="text-sm font-display font-medium text-campus-dark">
                    {m.LostItemName} ↔ {m.FoundItemName}
                  </p>
                  <p className="text-xs text-campus-muted font-body">Match confirmed</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
