import React from 'react'

const PriorityCounter = ({
    notes,
    colors,
    selectedFilter,
    setSelectedFilter,
    showFilters,
    setShowFilters,
    isClickThrough,
}) => {
    // Count notes by color/priority
    const getCountByColor = (color) => {
        return notes.filter((note) => note.color === color).length
    }
    const totalCount = notes.length || 0
    console.log(selectedFilter)
    return (
        <div
            style={{
                pointerEvents: isClickThrough ? 'none' : 'auto',
                WebkitAppRegion: 'no-drag',
            }}
            className="Bricolage_Grotesque mt-auto gap-2 pt-1 border-t border-white/10 w-full flex-1 flex justify-center items-center"
        >
            <div className="flex  justify-start gap-2 items-center  text-xs">
                {colors.map((colorItem) => {
                    const count = getCountByColor(colorItem.color)
                    return (
                        <div
                            onClick={() => {
                                setSelectedFilter(colorItem.color)
                                setShowFilters(false)
                            }}
                            key={colorItem.id}
                            className={`p-1 rounded-md flex items-center gap-1  transition-opacity cursor-pointer hover:bg-white/30 ${
                                selectedFilter != colorItem.color
                                    ? 'hover:bg-white/30'
                                    : 'bg-white/30'
                            }`}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: colorItem.color }}
                            />
                            <span className="text-white font-medium">
                                {count}
                            </span>
                        </div>
                    )
                })}
            </div>
            <div
                className={`flex items-center justify-center gap-1 text-xs cursor-pointer p-1 rounded-md hover:bg-white/30 ${
                    selectedFilter != null ? 'hover:bg-white/30' : 'bg-white/30'
                }`}
                onClick={() => {
                    setSelectedFilter(null)
                    setShowFilters(false)
                }}
            >
                <div className="flex flex-row justify-center items-center gap-1 text-white text-[12px] uppercase tracking-wide ">
                    {totalCount}
                    <div className='w-full'>
                        <div className="flex flex-row -space-x-3 px-3 ">
                            {colors.map((colorItem) => {
                                return (
                                    <div className="">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    colorItem.color,
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PriorityCounter
