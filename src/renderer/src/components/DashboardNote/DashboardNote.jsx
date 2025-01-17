import { parseContent } from '../../utils/textEditorUtils/textEditorUtils';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import Preview from '../Preview/Preview';
import { setPublishable } from '../../services/notesService/notesService';
import { displayError } from '../../utils/responseUtils/responseUtils';
import {
    createDashboardLink,
    groupSubtypes,
    LinkTreeFlattener,
    SubtypeHierarchy,
    truncateText,
} from '../../utils/dashboardUtils/dashboardUtils';
import { useLocation } from 'react-router-dom';
import Collapsible from '../Collapsible/Collapsible';
import { queryEntries } from '../../services/queryService/queryService';
import ReferenceTree from '../ReferenceTree/ReferenceTree';

/**
 * DashboardNote component - This component is used to display a note on the dashboard.
 * @function DashboardNote
 */
export default function DashboardNote({
    note,
    setAlert,
    publishMode,
    selectedNoteIds,
    setSelectedNoteIds,
}) {
    const [isPublishable, setIsPublishable] = useState(note.publishable);
    const [isSelected, setIsSelected] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [parsedContent, setParsedContent] = useState('');

    useEffect(() => {
        parseContent(note.content, note.files)
            .then((parsedContent) => setParsedContent(parsedContent))
            .catch(displayError(setAlert, navigate));
    }, [note.content, note.files, setAlert, navigate]);

    // Toggle the note's "publishable" status
    const handleTogglePublishable = useCallback(
        (noteId) => {
            setPublishable(noteId, !isPublishable)
                .then((response) => {
                    if (response.status === 200) {
                        setIsPublishable(!isPublishable);
                    }
                })
                .catch(displayError(setAlert, navigate));
        },
        [isPublishable, setIsPublishable, setAlert, navigate],
    );

    // Handle selecting this note for publishing
    const handleSelectNote = () => {
        setSelectedNoteIds((prevNoteIds) => {
            const noteIdx = prevNoteIds.indexOf(note.id);
            if (noteIdx !== -1) {
                setIsSelected(false);
                return prevNoteIds.filter((id) => id !== note.id);
            } else {
                setIsSelected(true);
                return [...prevNoteIds, note.id];
            }
        });
    };

    // Keep note.publishable up to date
    useEffect(() => {
        note.publishable = isPublishable;
    }, [isPublishable, note]);

    // Update the isSelected state if selectedNoteIds changes from the outside
    useEffect(() => {
        if (selectedNoteIds) {
            setIsSelected(selectedNoteIds.includes(note.id));
        }
    }, [selectedNoteIds, note.id]);

    return (
        <>
            {(!publishMode || (publishMode && isPublishable)) && (
                <div
                    className={`bg-cradle3 ${
                        isSelected ? 'bg-opacity-30' : 'bg-opacity-10'
                    } p-4 backdrop-blur-lg rounded-xl m-3 shadow-md`}
                >
                    {/* Header row with timestamp and publish/check UI */}
                    <div className='flex flex-row justify-between'>
                        <div className='text-zinc-300 text-xs w-full'>
                            {new Date(note.timestamp).toLocaleString()}
                        </div>

                        {publishMode ? (
                            <input
                                data-testid='select-btn'
                                type='checkbox'
                                checked={isSelected}
                                className='form-checkbox checkbox checkbox-primary'
                                onClick={handleSelectNote}
                            />
                        ) : (
                            <span className='pb-1 space-x-1 flex flex-row'>
                                <label
                                    htmlFor={`publishable-switch-${note.id}`}
                                    className='text-xs text-zinc-300 hover:cursor-pointer'
                                >
                                    Publishable
                                </label>
                                <input
                                    checked={isPublishable}
                                    id={`publishable-switch-${note.id}`}
                                    type='checkbox'
                                    className='switch switch-ghost-primary'
                                    onChange={() => handleTogglePublishable(note.id)}
                                />
                            </span>
                        )}
                    </div>

                    {!parsedContent && (
                        <div className='flex items-center justify-center min-h-screen'>
                            <div className='spinner-dot-pulse'>
                                <div className='spinner-pulse-dot'></div>
                            </div>
                        </div>
                    )}
                    {/* Main content preview */}
                    <div
                        className='bg-transparent h-fit p-2 backdrop-filter overflow-hidden flex-grow flex space-y-2 flex-col cursor-pointer'
                        onClick={() =>
                            navigate(`/notes/${note.id}`, {
                                state: { from: location, state: location.state },
                            })
                        }
                    >
                        <div className="max-h-[36rem] overflow-y-auto">
                            <Preview htmlContent={parsedContent} />
                        </div>
                    </div>

                    {/* References Section (Now a separate component) */}
                    {note.entry_classes && parsedContent && (
                        <ReferenceTree note={note} setAlert={setAlert} />
                    )}
                </div>
            )}
        </>
    );
}
