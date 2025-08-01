import React from 'react';
import { useLocation } from 'react-router-dom';
import Tooltip from '../Tooltip/Tooltip';

/**
 * SidebarItem component - single button in the sidebar
 *
 * @function SidebarItem
 * @param {Object} props - the props object
 * @param {React.Component} props.icon - icon to display in the button
 * @param {string} [props.text=''] - text to display in the button (not shown unless hovered)
 * @param {Function} props.handleClick - handler for the button
 * @param {string} [props.highlightedLocation=''] - the location to highlight. If the location is the same as the current location, the button is highlighted
 * @returns {SidebarItem}
 * @constructor
 */
export default function SidebarItem({
    icon,
    text = '',
    handleClick,
    highlightedLocation = '',
    compact = false,
}) {
    const location = useLocation();
    const isHighlighted = location.pathname === highlightedLocation;

    if (compact) {
        return (
            <Tooltip content={text} position='right'>
                <li
                    className={`menu-item p-4 cursor-pointer group-hover/sidebar:flex items-center z-50 relative
                    ${isHighlighted ? 'menu-active' : ''}`}
                    onClick={handleClick}
                >
                    <div className='icon flex-shrink-0 text-primary hover:bg-gray-4'>
                        {icon}
                    </div>
                </li>
            </Tooltip>
        );
    } else {
        return (
            <li
                className={`menu-item p-4 cursor-pointer group-hover/sidebar:flex items-center z-50 relative
                    ${isHighlighted ? 'menu-active' : ''}`}
                onClick={handleClick}
            >
                <div className='icon flex-shrink-0 text-primary hover:bg-gray-4'>
                    {icon}
                </div>
                <div className='hidden whitespace-nowrap ml-2 group-hover/sidebar:block'>
                    {text}
                </div>
            </li>
        );
    }
}
