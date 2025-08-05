import React from 'react'

const PriorityCounter = ({ notes, colors }) => {
    // Count notes by color/priority
    const getCountByColor = (color) => {
        return notes.filter((note) => note.color === color).length
    }
    const totalCount = notes.length || 0

    return (
        <div className="jetbrains-mono-200 mt-auto gap-2 pt-3 border-t border-white/10 w-full flex-1 flex justify-center items-center">
            <div className="flex  justify-start gap-4 items-center  text-xs">
                {colors.map((colorItem) => {
                    const count = getCountByColor(colorItem.color)
                    return (
                        <div
                            key={colorItem.id}
                            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
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
            <div className="flex items-center justify-center gap-1 text-xs ">
                <span className="text-white text-[12px] uppercase tracking-wide">
                    = {totalCount}
                </span>
            </div>
        </div>
    )
}

export default PriorityCounter
