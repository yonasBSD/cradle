import { useState, useEffect, useCallback } from 'react';
import FileItem from '../FileItem/FileItem';
import { getFiles } from '../../services/notesService/notesService';
import AlertBox from '../AlertBox/AlertBox';
import Pagination from '../Pagination/Pagination';
import { useSearchParams } from 'react-router-dom';
import { useDroppable } from '@dnd-kit/core';
import { useProfile } from '../../contexts/ProfileContext/ProfileContext';
import { formatDate } from '../../utils/dateUtils/dateUtils';
import { createDownloadPath } from '../../utils/textEditorUtils/textEditorUtils';
import { authAxios } from '../../services/axiosInstance/axiosInstance';
import { Download, Notes } from 'iconoir-react';

/**
 * FilesList component - This component is used to display a list of files.
 * @function FilesList
 * @param {Object} props - Component props
 * @param {Object} props.query - Query parameters for filtering files
 * @param {Array} props.filteredFiles - Files to filter out from the results
 * @param {Array} props.fileActions - Actions that can be performed on files
 * @param {Object} props.references - References for drag and drop functionality
 * @param {Function} props.setAlert - Function to set alerts (optional)
 * @param {Function} props.onError - Error handler function (optional)
 * @returns {JSX.Element}
 */
export default function FilesList({
    query = {},
    filteredFiles = [],
    fileActions = [],
    references = null,
    setAlert: externalSetAlert = null,
    onError = null,
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [files, setFiles] = useState([]);
    const [alert, setInternalAlert] = useState({
        show: false,
        message: '',
        color: 'red',
    });

    // Use external setAlert if provided, otherwise use internal
    const setAlert = externalSetAlert || setInternalAlert;
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(Number(searchParams.get('files_page')) || 1);
    const { profile } = useProfile();

    const { setNodeRef } = useDroppable({
        id: 'files-droppable',
    });

    const fetchFiles = useCallback(() => {
        setLoading(true);
        console.log(query, page, onError, setAlert);

        const params = {
            page,
            ...query,
        };

        getFiles(params)
            .then((response) => {
                setFiles(response.data.results);
                setTotalPages(response.data.total_pages);
                setLoading(false);
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                } else {
                    setAlert({
                        show: true,
                        message: 'Failed to fetch files. Please try again.',
                        color: 'red',
                    });
                }
                setLoading(false);
            });
    }, [page, query, setAlert]);

    useEffect(() => {
        setPage(Number(searchParams.get('files_page')) || 1);
        fetchFiles();
    }, [fetchFiles]);

    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('files_page', newPage);
        setSearchParams(newParams);

        setPage(newPage);
    };

    return (
        <>
            <div className='flex flex-col space-y-4'>
                <AlertBox alert={alert} setAlert={setAlert} />

                <div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />

                    {loading ? (
                        <div className='flex items-center justify-center h-full'>
                            <div className='spinner-dot-pulse spinner-xl'>
                                <div className='spinner-pulse-dot'></div>
                            </div>
                        </div>
                    ) : files.length > 0 ? (
                        <div className='files-list'>
                            <div
                                ref={setNodeRef}
                                className='grid grid-cols-1 gap-2 p-4'
                            >
                                {profile?.compact_mode ? (
                                    <div className='overflow-x-auto w-full'>
                                        <table className='table table-zebra'>
                                            <thead className=''>
                                                <tr>
                                                    <th className='w-64'>Name</th>
                                                    <th className='w-32'>
                                                        Uploaded At
                                                    </th>
                                                    <th className='w-32'>Entities</th>
                                                    <th className='w-32'>MimeType</th>
                                                    <th className=''>MD5</th>
                                                    <th className=''>SHA1</th>
                                                    <th className=''>SHA256</th>
                                                    <th className='w-32'>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className=''>
                                                {files.map((file, index) => {
                                                    for (const f of filteredFiles) {
                                                        if (f.id === file.id)
                                                            return null;
                                                    }
                                                    return (
                                                        <tr key={file.id || index}>
                                                            <td className=''>
                                                                {file.file_name}
                                                            </td>
                                                            <td className=''>
                                                                {formatDate(
                                                                    new Date(
                                                                        file.timestamp,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td className=''>
                                                                <div className='flex flex-wrap gap-1'>
                                                                    {file.entities?.map(
                                                                        (entity) => (
                                                                            <span
                                                                                key={
                                                                                    entity.name
                                                                                }
                                                                                className='badge badge-xs px-1 text-white'
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        entity.color ||
                                                                                        '#ccc',
                                                                                }}
                                                                            >
                                                                                {
                                                                                    entity.name
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className=''>
                                                                {file.mimetype || 'N/A'}
                                                            </td>
                                                            <td className=''>
                                                                {file.md5_hash ? (
                                                                    <span
                                                                        className='cursor-pointer hover:bg-zinc-400 hover:dark:bg-zinc-800 px-1 rounded'
                                                                        onClick={() =>
                                                                            navigator.clipboard.writeText(
                                                                                file.md5_hash,
                                                                            )
                                                                        }
                                                                        title='Click to copy'
                                                                    >
                                                                        {file.md5_hash.substring(
                                                                            0,
                                                                            16,
                                                                        )}
                                                                        ...
                                                                    </span>
                                                                ) : (
                                                                    'N/A'
                                                                )}
                                                            </td>
                                                            <td className=''>
                                                                {file.sha1_hash ? (
                                                                    <span
                                                                        className='cursor-pointer hover:bg-zinc-400 hover:dark:bg-zinc-800 px-1 rounded'
                                                                        onClick={() =>
                                                                            navigator.clipboard.writeText(
                                                                                file.sha1_hash,
                                                                            )
                                                                        }
                                                                        title='Click to copy'
                                                                    >
                                                                        {file.sha1_hash.substring(
                                                                            0,
                                                                            32,
                                                                        )}
                                                                        ...
                                                                    </span>
                                                                ) : (
                                                                    'N/A'
                                                                )}
                                                            </td>
                                                            <td className=''>
                                                                {file.sha256_hash ? (
                                                                    <span
                                                                        className='cursor-pointer hover:bg-zinc-400 hover:dark:bg-zinc-800 px-1 rounded'
                                                                        onClick={() =>
                                                                            navigator.clipboard.writeText(
                                                                                file.sha256_hash,
                                                                            )
                                                                        }
                                                                        title='Click to copy'
                                                                    >
                                                                        {file.sha256_hash.substring(
                                                                            0,
                                                                            32,
                                                                        )}
                                                                        ...
                                                                    </span>
                                                                ) : (
                                                                    'N/A'
                                                                )}
                                                            </td>
                                                            <td className='w-32'>
                                                                <div className='flex space-x-1'>
                                                                    <button
                                                                        onClick={() => {
                                                                            const navigate =
                                                                                window.location.hash.includes(
                                                                                    '#',
                                                                                )
                                                                                    ? (
                                                                                          path,
                                                                                      ) =>
                                                                                          (window.location.hash =
                                                                                              path)
                                                                                    : (
                                                                                          path,
                                                                                      ) =>
                                                                                          (window.location.href =
                                                                                              path);
                                                                            navigate(
                                                                                `/notes/${file.note_id}`,
                                                                            );
                                                                        }}
                                                                        className='btn btn-ghost btn-xs text-blue-600 hover:text-blue-500'
                                                                        title='View Note'
                                                                    >
                                                                        <Notes
                                                                            className='w-4 h-4'
                                                                            aria-hidden='true'
                                                                        />
                                                                    </button>
                                                                    {file.bucket_name &&
                                                                        file.minio_file_name && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    // Download logic similar to FileItem
                                                                                    const url =
                                                                                        createDownloadPath(
                                                                                            {
                                                                                                bucket_name:
                                                                                                    file.bucket_name,
                                                                                                minio_file_name:
                                                                                                    file.minio_file_name,
                                                                                            },
                                                                                        );

                                                                                    authAxios
                                                                                        .get(
                                                                                            url,
                                                                                        )
                                                                                        .then(
                                                                                            (
                                                                                                response,
                                                                                            ) => {
                                                                                                const {
                                                                                                    presigned,
                                                                                                } =
                                                                                                    response.data;
                                                                                                const link =
                                                                                                    document.createElement(
                                                                                                        'a',
                                                                                                    );
                                                                                                link.href =
                                                                                                    presigned;
                                                                                                const fileName =
                                                                                                    file.minio_file_name
                                                                                                        .split(
                                                                                                            '/',
                                                                                                        )
                                                                                                        .pop() ||
                                                                                                    file.minio_file_name;
                                                                                                link.download =
                                                                                                    fileName;
                                                                                                document.body.appendChild(
                                                                                                    link,
                                                                                                );
                                                                                                link.click();
                                                                                                document.body.removeChild(
                                                                                                    link,
                                                                                                );
                                                                                            },
                                                                                        )
                                                                                        .catch(
                                                                                            (
                                                                                                error,
                                                                                            ) => {
                                                                                                setAlert(
                                                                                                    {
                                                                                                        show: true,
                                                                                                        message:
                                                                                                            'Failed to download file. Please try again.',
                                                                                                        color: 'red',
                                                                                                    },
                                                                                                );
                                                                                            },
                                                                                        );
                                                                                }}
                                                                                className='btn btn-ghost btn-xs text-green-600 hover:text-green-500'
                                                                                title='Download'
                                                                            >
                                                                                <Download
                                                                                    className='w-4 h-4'
                                                                                    aria-hidden='true'
                                                                                />
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    files.map((file, index) => {
                                        for (const f of filteredFiles) {
                                            if (f.id === file.id) return null;
                                        }
                                        return (
                                            <FileItem
                                                id={file.id}
                                                key={index}
                                                file={file}
                                                setAlert={setAlert}
                                                actions={fileActions}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='container mx-auto flex flex-col items-center'>
                            <p className='mt-6 !text-sm !font-normal text-zinc-500'>
                                No files found!
                            </p>
                        </div>
                    )}

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
}
