import CodeMirror from '@uiw/react-codemirror';
import { vim } from '@replit/codemirror-vim';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { drawSelection } from '@uiw/react-codemirror';
import { useId, useState, useRef, useCallback } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import FileInput from '../FileInput/FileInput';
import FileTable from '../FileTable/FileTable';
import { NavArrowDown, NavArrowUp } from 'iconoir-react/regular';
import {
    entityTypes,
    entrySubtypes,
    metadataSubtypes,
} from '../../utils/entityDefinitions/entityDefinitions';
import { queryEntities } from '../../services/queryService/queryService';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { completionKeymap, acceptCompletion } from '@codemirror/autocomplete';
import { getLinkNode, parseLink } from '../../utils/textEditorUtils/textEditorUtils';
import { Prec } from '@uiw/react-codemirror';

/**
 * @typedef {Object} FileData
 * @property {string} minio_file_name - the name of the file in MinIO
 * @property {string} file_name - the name of the file
 * @property {string} bucket_name - the name of the bucket
 * @typedef {Array<FileData>} FileDataArray
 */

/**
 * This component makes use of a pre-existing code editor component (CodeMirror, see https://github.com/uiwjs/react-codemirror)
 * The Editor component is expected to be used for typing Markdown. It also has a toggle for enabling Vim mode in the editor.
 *
 * It also allows the user to upload files and view them in a table below the editor. These files have specific tags that can be copied to the clipboard.
 * By referencing these tags in the markdown content, the user can include the files in the note. A download link for that file will be generated in the preview.
 *
 * This component is reactive to the system theme. It uses the Eclipse theme for light mode and the VSCode Dark theme for dark mode.
 *
 * @param {string} markdownContent - the content inside the Editor
 * @param {(string) => void} setMarkdownContent - callback used when the value of the content changes
 * @param {FileData} fileData - the files uploaded by the user. These belong to the note that is being written.
 * @param {(FileData) => void} setFileData - callback used when the files change
 * @param {boolean} isLightMode - the current theme of the editor
 * @returns {Editor}
 */
export default function Editor({
    markdownContent,
    setMarkdownContent,
    fileData,
    setFileData,
    isLightMode,
}) {
    const [enableVim, setEnableVim] = useState(false);
    const [showFileList, setShowFileList] = useState(false);
    const vimModeId = useId();
    const editorRef = useRef(null);

    const auth = useAuth();

    const performSearch = async (name, type, subtype) => {
        return queryEntities(name, type, subtype)
            .then((response) => {
                let data = response.data.map((x) => ({
                    label: x.name,
                    type: 'keyword',
                }));
                return data;
            })
            .catch((error) => {
                console.log(error);
                return [];
            });
    };

    // Autocomplete links (e.g. syntax `[[...]]`) using information from the database. Uses the `/query` endpoint to get the data.
    const linkAutoComplete = (context) => {
        let node = getLinkNode(context);

        if (node == null) return { from: context.pos, options: [] };

        const linkFull = context.state.sliceDoc(node.from, node.to);
        const parsedLink = parseLink(node.from, context.pos, linkFull);

        if (parsedLink == null) return { from: context.pos, options: [] };

        let options = new Promise((f) => f([]));

        if (parsedLink.type == null) {
            options = new Promise((f) =>
                f(
                    [entityTypes, entrySubtypes, metadataSubtypes].flatMap((set) =>
                        Array.from(set).map((item) => ({
                            label: item,
                            type: 'keyword',
                        })),
                    ),
                ),
            );
        } else if (entrySubtypes.has(parsedLink.type) && parsedLink.text.length >= 3) {
            options = performSearch(parsedLink.text, [], [parsedLink.type]);
        } else if (!entrySubtypes.has(parsedLink.type)) {
            options = performSearch(parsedLink.text, [parsedLink.type], []);
        }

        return options.then((o) => {
            return {
                from: parsedLink.from,
                to: parsedLink.to,
                options: o,
            };
        });
    };

    const autoCompleteConfig = markdownLanguage.data.of({
        autocomplete: linkAutoComplete,
    });

    var extensions = [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        drawSelection(),
        EditorView.lineWrapping,
        autoCompleteConfig,
        Prec.highest(
            keymap.of([
                ...completionKeymap,
                {
                    key: 'Tab',
                    run: acceptCompletion,
                },
            ]),
        ),
    ];

    if (enableVim) {
        // This editor also has the option to be used in vim mode, which can be toggled.
        // https://codemirror.net/5/demo/vim.html
        extensions = extensions.concat(vim());
    }

    const toggleFileList = useCallback(() => {
        setShowFileList(!showFileList);
    }, [showFileList]);

    return (
        <div className='h-full w-full flex flex-col flex-1'>
            <div className='h-full w-full flex flex-col overflow-auto'>
                <div className='flex flex-row justify-between p-2'>
                    <span className='max-w-[55%]'>
                        <FileInput fileData={fileData} setFileData={setFileData} />
                    </span>
                    <span className='flex flex-row space-x-2 items-center'>
                        <label
                            htmlFor={vimModeId}
                            className='flex flex-row items-center cursor-pointer'
                        >
                            <img
                                src='https://www.vim.org/images/vim32x32.gif'
                                alt=''
                                style={{ width: '25px' }}
                            />
                        </label>
                        <input
                            id={vimModeId}
                            data-testid='vim-toggle'
                            name='vim-toggle'
                            type='checkbox'
                            className='switch switch-ghost-primary my-1'
                            checked={enableVim}
                            onChange={() => setEnableVim(!enableVim)}
                        />
                    </span>
                </div>
                <div className='overflow-hidden w-full rounded-lg'>
                    <CodeMirror
                        name='markdown-input'
                        id='markdown-input'
                        data-testid='markdown-input'
                        theme={isLightMode ? eclipse : vscodeDark}
                        height='100%'
                        extensions={extensions}
                        className='w-full h-full resize-none'
                        onChange={setMarkdownContent}
                        value={markdownContent}
                        ref={editorRef}
                    />
                </div>
            </div>
            {fileData && fileData.length > 0 && (
                <div className='max-h-[25%] rounded-md flex flex-col justify-end z-30'>
                    <div
                        className='bg-gray-3 text-zinc-200 px-4 py-[2px] my-1 rounded-md hover:cursor-pointer flex flex-row space-x-2'
                        onClick={toggleFileList}
                    >
                        <span>
                            {showFileList ? (
                                <NavArrowDown width='20px' />
                            ) : (
                                <NavArrowUp width='20px' />
                            )}
                        </span>
                        <span>
                            {showFileList
                                ? 'Hide Uploaded Files'
                                : 'Show Uploaded Files'}
                        </span>
                    </div>
                    <div
                        className={`overflow-auto h-full rounded-md ${showFileList && 'min-h-24'}`}
                    >
                        {showFileList && (
                            <FileTable fileData={fileData} setFileData={setFileData} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
