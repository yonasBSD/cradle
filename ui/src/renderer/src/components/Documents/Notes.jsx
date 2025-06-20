import { useState, useEffect } from 'react';
import { Search } from 'iconoir-react';
import NotesList from '../NotesList/NotesList';
import { useSearchParams } from 'react-router-dom';
import Publishable from '../NoteActions/Publishable';
import DeleteNote from '../NoteActions/DeleteNote';

/**
 * Notes component
 * Allows the user to search through all notes they have access to
 * Provides search filters for content and author
 * Fetches notes based on the provided search filters
 *
 * @function Notes
 * @returns {Notes}
 * @constructor
 */
export default function Notes({ setAlert }) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchFilters, setSearchFilters] = useState({
        content: searchParams.get('content') || '',
        author__username: searchParams.get('author__username') || '',
    });

    const [submittedFilters, setSubmittedFilters] = useState({
        content: searchParams.get('content') || '',
        author__username: searchParams.get('author__username') || '',
    });

    useEffect(() => {}, [submittedFilters]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const { content, author__username } = searchFilters;

        const newParams = new URLSearchParams(searchParams);
        newParams.set('content', searchFilters.content);
        newParams.set('author__username', searchFilters.author__username);
        setSearchParams(newParams, { replace: true });

        setSubmittedFilters(searchFilters);
    };

    const handleSearchChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSearchFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    useEffect(() => {
        setSearchFilters({
            content: searchParams.get('content') || '',
            author__username: searchParams.get('author__username') || '',
        });
    }, [searchParams]);

    return (
        <div className='w-full h-full flex flex-col space-y-3'>
            <div className='flex justify-between items-center w-full border-b border-gray-700 px-4 pb-3'>
                <h1 className='text-4xl font-bold w-full break-all'>All Notes</h1>
            </div>
            <form onSubmit={handleSearchSubmit} className='flex space-x-4 px-3 pb-2'>
                <input
                    type='text'
                    name='content'
                    value={searchFilters.content}
                    onChange={handleSearchChange}
                    placeholder='Search by content'
                    className='input !max-w-full w-full'
                />
                <input
                    type='text'
                    name='author__username'
                    value={searchFilters.author__username}
                    onChange={handleSearchChange}
                    placeholder='Search by author'
                    className='input !max-w-full w-full'
                />
                <button type='submit' className='btn w-1/2'>
                    <Search /> Search
                </button>
            </form>

            <NotesList
                query={submittedFilters}
                noteActions={[
                    { Component: Publishable, props: { setAlert } },
                    { Component: DeleteNote, props: { setAlert } },
                ]}
            />
        </div>
    );
}
