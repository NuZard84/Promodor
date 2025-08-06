import React from 'react'
import { Filter } from 'lucide-react'

const FilterButton = ({
    selectedFilter,
    setSelectedFilter,
    showFilters,
    setShowFilters,
}) => {
    const filterColors = [
        { id: 'high', color: '#FF6B47', label: 'High Priority' },
        { id: 'medium', color: '#FFB443', label: 'Medium Priority' },
        { id: 'low', color: '#4ECDC4', label: 'Low Priority' },
        { id: 'neutral', color: '#8F9DAF', label: 'No Priority' },
    ]

    return (
        <div className="relative Bricolage_Grotesque ">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-7 h-7 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
                style={{
                  
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                title="Filter by priority"
            >
                <Filter size={14} />
                {selectedFilter && (
                    <div
                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                        style={{ backgroundColor: selectedFilter }}
                    />
                )}
            </button>

            {showFilters && (
                <div
                    className="absolute right-0 mt-1 bg-black bg-opacity-50 rounded-lg p-2 border border-white border-opacity-10 z-50"
                    style={{ minWidth: '120px' }}
                >
                    <div
                        className="cursor-pointer p-1.5 rounded hover:bg-white hover:bg-opacity-10 text-xs text-white mb-1"
                        onClick={() => {
                            setSelectedFilter(null)
                            setShowFilters(false)
                        }}
                    >
                        All Notes
                    </div>
                    {filterColors.map(({ id, color, label }) => (
                        <div
                            key={id}
                            className="cursor-pointer p-1.5 rounded hover:bg-white hover:bg-opacity-10 flex items-center space-x-2"
                            onClick={() => {
                                setSelectedFilter(color)
                                setShowFilters(false)
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-[10px] text-white">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FilterButton
