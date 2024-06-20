export default function NoteListCard({ title, notes = [] }) {
    return (
        <div className='card overflow-auto !max-w-none'>
            <div className='card-body'>
                <h2 className='card-header'>{title}</h2>
                {notes.map((note, index) => {
                    const name = `${index + 1}. ${note}`; // todo note.name
                    return (
                        <div
                            key={index}
                            className='opacity-90 hover:opacity-70 active:opacity-50 hover:cursor-pointer card p-2 
                            bg-gray-2 hover:bg-gray-2 active:bg-gray-3 !max-w-none'
                            onClick={() => {
                                console.log('clicked', note);
                            }}
                        >
                            <h5 className='card-title'>{name}</h5>
                            <p className='card-text'>{note.timestamp || ''}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
