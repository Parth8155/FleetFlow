/**
 * Utility functions for exporting data in various formats
 */

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers, defaults to object keys
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) {
    return 'No data'
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0])

  // Create header row
  const headerRow = csvHeaders.map(h => `"${h}"`).join(',')

  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders
      .map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if needed
        if (value === null || value === undefined) {
          return '""'
        }
        const stringValue = String(value).replace(/"/g, '""')
        return `"${stringValue}"`
      })
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Generate CSV content for expense report
 * @param {Object} report - Report data with expenses array
 * @returns {string} CSV formatted string
 */
export const generateExpenseCSV = (report) => {
  if (!report.expenses || report.expenses.length === 0) {
    return 'No expenses found'
  }

  const headers = ['ID', 'Vehicle ID', 'Type', 'Amount', 'Units', 'Description', 'Date']
  const data = report.expenses.map(expense => ({
    ID: expense.id,
    'Vehicle ID': expense.vehicleId,
    Type: expense.type,
    Amount: expense.amount,
    Units: expense.units || '',
    Description: expense.description || '',
    Date: new Date(expense.date).toISOString().split('T')[0],
  }))

  const csvContent = convertToCSV(data, headers)

  // Add summary
  const summary = `\n\nSummary\nTotal Cost,${report.totalCost}\nFuel Cost,${report.fuelCost}\nMaintenance Cost,${report.maintenanceCost}\nFuel Percentage,${report.summary.fuelPercentage}%\nMaintenance Percentage,${report.summary.maintenancePercentage}%`

  return csvContent + summary
}

/**
 * Generate plain text financial report
 * @param {Object} report - Report data
 * @param {string} vehicleInfo - Optional vehicle information
 * @returns {string} Formatted text report
 */
export const generateFinancialReportText = (report, vehicleInfo = '') => {
  const lines = [
    '====== FINANCIAL REPORT ======',
    vehicleInfo ? `Vehicle: ${vehicleInfo}` : '',
    `Report Generated: ${new Date().toISOString()}`,
    '',
    '--- SUMMARY ---',
    `Total Cost: ₹${report.totalCost.toFixed(2)}`,
    `Fuel Cost: ₹${report.fuelCost.toFixed(2)} (${report.summary.fuelPercentage}%)`,
    `Maintenance Cost: ₹${report.maintenanceCost.toFixed(2)} (${report.summary.maintenancePercentage}%)`,
    '',
    '--- EXPENSE DETAILS ---',
  ]

  if (report.expenses && report.expenses.length > 0) {
    lines.push(`Total Expenses: ${report.expenses.length}`)
    lines.push('')
    report.expenses.forEach((expense, index) => {
      lines.push(`${index + 1}. ${expense.type.toUpperCase()}`)
      lines.push(`   Amount: ₹${expense.amount.toFixed(2)}`)
      if (expense.units) lines.push(`   Quantity: ${expense.units}`)
      if (expense.description) lines.push(`   Description: ${expense.description}`)
      lines.push(`   Date: ${new Date(expense.date).toISOString().split('T')[0]}`)
      lines.push('')
    })
  }

  return lines.filter(l => l !== '').join('\n')
}

/**
 * Format number as currency
 * @param {number} amount
 * @param {string} currency - Default 'INR'
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date to readable format
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
