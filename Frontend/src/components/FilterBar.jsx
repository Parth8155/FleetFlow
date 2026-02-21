import { FunnelIcon, ArrowsUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function FilterBar({ 
  searchQuery, 
  onSearchChange,
  
  // Filter Props
  filters, 
  onFilterChange, // (key, value) => ...
  filterOptions = [], // [{ key, label, options: [{value, label}] }]
  
  // Sort Props
  sortConfig, // { key: 'name', direction: 'asc' }
  onSortChange, // (key) => ...
  sortOptions = [], // [{ value, label }]
  
  // Actions
  onReset
}) {
  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
        
        {/* Search & Filters Group */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          
          {/* Search */}
          <div className="w-full sm:w-64 space-y-1.5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MagnifyingGlassIcon className="w-3.5 h-3.5" />
              Search
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="input-field py-1.5 px-3 text-sm w-full"
              />
            </div>
          </div>

          {/* Filters */}
          {filterOptions.map((filter) => (
            <div key={filter.key} className="w-full sm:w-40 space-y-1.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FunnelIcon className="w-3.5 h-3.5" />
                {filter.label}
              </h3>
              <div className="relative">
                <select
                  value={filters[filter.key] || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="input-field appearance-none py-1.5 px-3 text-sm w-full"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sort & Reset Group */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          
          {/* Sort */}
          {sortOptions.length > 0 && (
            <div className="space-y-1.5 w-full sm:w-auto">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                Sort
              </h3>
              <div className="flex gap-2">
                <div className="relative w-32">
                  <select
                    value={sortConfig.key}
                    onChange={(e) => onSortChange(e.target.value)} // Pass just the key
                    className="input-field appearance-none py-1.5 px-3 text-sm w-full"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
                <button
                  onClick={() => onSortChange(sortConfig.key)} // Trigger toggle direction
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1 min-w-[70px] justify-center"
                >
                  {sortConfig.direction === 'asc' ? '↑ ASC' : '↓ DESC'}
                </button>
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={onReset}
              className="h-[34px] px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all uppercase tracking-wider"
            >
              Reset
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}