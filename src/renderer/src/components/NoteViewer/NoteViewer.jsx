import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth/useAuth";
import { getNote } from "../../services/notesService/notesService";
import Preview from "../Preview/Preview";
import { parseContent } from "../../utils/textEditorUtils/textEditorUtils";
import useNavbarContents from "../../hooks/useNavbarContents/useNavbarContents";
import { Code } from "iconoir-react";
import NavbarItem from "../NavbarItem/NavbarItem";

export default function NoteViewer() {
    const { id } = useParams();
    const [noteContent, setNoteContent] = useState("");
    const [noteTimestamp, setNoteTimestamp] = useState("");
    const [isRaw, setIsRaw] = useState(false);
    const auth = useAuth();

    useEffect(() => {
        getNote(auth.access, id)
            .then(response => {
                setNoteContent(response.data.content);
                setNoteTimestamp(response.data.timestamp);
            })
            .catch(err => {
                console.error(err);
            });
    }, [auth.access, id]);

    const toggleView = useCallback(() => {
        setIsRaw(prevIsRaw => !prevIsRaw);
    }, []);

    useNavbarContents([
        <NavbarItem
            icon={<Code />}
            onClick={toggleView}
        />
    ], [toggleView, id]);

    return (
        <div className="w-full h-full overflow-hidden flex flex-col items-center p-4">
            <div className="h-full w-[90%] rounded-md bg-cradle3 bg-opacity-20 backdrop-blur-lg backdrop-filter p-4 overflow-y-auto">
                <div className="text-sm text-zinc-500 p-2">
                    {new Date(noteTimestamp).toLocaleString()}
                </div>
                <div className="flex-grow">
                    {isRaw ? (
                        <pre className="prose dark:prose-invert break-all overflow-x-hidden">{noteContent}</pre>
                    ) : (
                        <Preview htmlContent={parseContent(noteContent)} />
                    )}
                </div>
            </div>
        </div>
    );
}
