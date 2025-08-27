 const DeleteAllNotesComponent = ({ notes, deleteAllNotes }) => {
    return (
        <>
            {notes.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={deleteAllNotes}
                        className="flex justify-center items-center gap-2 w-7 h-7 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded-lg transition-colors duration-200 border border-red-500/30 hover:border-red-500/50"
                        // className=" w-7 h-7 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center cursor-pointer"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            )}
        </>
    )
}

export default DeleteAllNotesComponent