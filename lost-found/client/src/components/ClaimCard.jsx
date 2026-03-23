import StatusBadge from './StatusBadge'

export default function ClaimCard({ claim }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-display font-medium text-campus-dark">
        #{claim.ClaimID}
      </td>
      <td className="px-4 py-3 text-sm font-body text-gray-700">
        {claim.UserName}
      </td>
      <td className="px-4 py-3 text-sm font-body text-gray-700">
        {claim.FoundItemName}
      </td>
      <td className="px-4 py-3 text-sm font-body text-gray-500">
        {new Date(claim.ClaimDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={claim.Status} />
      </td>
      <td className="px-4 py-3 text-sm font-body text-gray-500">
        {claim.AdminName || '—'}
      </td>
    </tr>
  )
}
