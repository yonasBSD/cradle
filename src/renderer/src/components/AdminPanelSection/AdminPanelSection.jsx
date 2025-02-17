import { PlusCircle } from 'iconoir-react';
import useFrontendSearch from '../../hooks/useFrontendSearch/useFrontendSearch';
import useAuth from '../../hooks/useAuth/useAuth';

/**
 * AdminPanelSection component - This component is used to display a section in the AdminPanel.
 * The section contains the following elements:
 * - Title
 * - Add button
 * - Search bar
 * - Children (cards)
 * The component will filter the children based on the search input.
 *
 * @function AdminPanelSection
 * @param {Object} props - The props object
 * @param {string} props.title - The title of the section
 * @param {boolean} props.addEnabled - Whether the add button is enabled
 * @param {string} props.addTooltipText - The tooltip text for the add button
 * @param {Function} props.handleAdd - The handler for the add button
 * @param {Array<React.ReactElement>} props.children - The children (cards) to display in the section
 * @returns {AdminPanelSection}
 * @constructor
 */
export default function AdminPanelSection({
    title,
    addEnabled,
    addTooltipText,
    handleAdd,
    children,
}) {
    const { searchVal, setSearchVal, filteredChildren } = useFrontendSearch(children);

    return (
        <div className='w-full h-fit bg-gray-2 rounded-md p-3'>
            <div className='w-full h-12 flex flex-row items-center justify-between'>
                <h1 className='text-2xl font-bold pl-2'>{title}</h1>
                {addEnabled && (
                    <span
                        className='tooltip tooltip-bottom'
                        data-tooltip={addTooltipText}
                    >
                        <button className='h-fit m-1' onClick={handleAdd}>
                            <PlusCircle />
                        </button>
                    </span>
                )}
            </div>
            <div className='w-full h-12 my-2'>
                <input
                    type='text'
                    placeholder='Search'
                    className='form-input input input-rounded input-md input-block input-ghost-primary focus:ring-0 w-full'
                    onChange={(e) => setSearchVal(e.target.value)}
                />
            </div>
            <div className='w-full flex flex-col space-y-2 gap-1'>
                {filteredChildren}
            </div>
        </div>
    );
}
