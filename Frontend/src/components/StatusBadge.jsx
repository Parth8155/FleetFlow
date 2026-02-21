function StatusBadge({ status }) {
  const statusClasses = {
    'available': 'status-available',
    'on-trip': 'status-on-trip',
    'in-shop': 'status-in-shop',
    'suspended': 'status-suspended',
    'on-duty': 'status-available',
    'off-duty': 'status-suspended',
    'completed': 'status-available',
    'draft': 'status-suspended',
    'dispatched': 'status-on-trip',
    'cancelled': 'status-suspended',
  }

  const statusLabels = {
    'available': 'Available',
    'on-trip': 'On Trip',
    'in-shop': 'In Shop',
    'suspended': 'Suspended',
    'on-duty': 'On Duty',
    'off-duty': 'Off Duty',
    'completed': 'Completed',
    'draft': 'Draft',
    'dispatched': 'Dispatched',
    'cancelled': 'Cancelled',
  }

  return (
    <span className={`status-badge ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  )
}

export default StatusBadge
