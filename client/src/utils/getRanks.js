export const GetRankBadge = ({ streak }) => {
    if (streak >= 60) {
        return (
            <img
                src="/assets/ranks/champion.png"
                alt="champion"
                className="h-full w-full"
            />
        )
    } else if (streak >= 30) {
        return (
            <img
                src="/assets/ranks/diamond.png"
                alt="diamond"
                className="h-full w-full"
            />
        )
    } else if (streak >= 14) {
        return (
            <img
                src="/assets/ranks/platinium.png"
                alt="platinium"
                className="h-full w-full"
            />
        )
    } else if (streak >= 7) {
        return (
            <img
                src="/assets/ranks/gold.png"
                alt="gold"
                className="h-full w-full"
            />
        )
    } else if (streak >= 3) {
        return (
            <img
                src="/assets/ranks/silver.png"
                alt="silver"
                className="h-full w-full"
            />
        )
    } else if (streak >= 0) {
        return (
            <img
                src="/assets/ranks/bronze.svg"
                alt="bronze"
                className="h-full w-full"
            />
        )
    } else {
        return (
            <div className="h-full w-full border-dashed border border-gray-400"></div>
        )
    }
}
