import React from 'react';

/**
 * SidebarSection component - section of the sidebar
 *
 * @param {string} sectionType - the type of section (header, content, footer)
 * @param {string} justify - the alignment of the items in the section
 * @param {string} height - the height of the section
 * @param {Array<React.Component} children - the children to display in the section
 * @returns {SidebarSection}
 * @constructor
 */
export default function SidebarSection({ sectionType, justify, height, children }) {
    const sectionVariants = {
        header: 'sidebar-header',
        content: 'sidebar-content',
        footer: 'sidebar-footer',
    };

    const justifyVariants = {
        start: 'justify-start',
        end: 'justify-end',
    };

    const heightVariants = {
        fit: 'h-fit',
        full: 'h-full',
    };

    return (
        <section
            className={`${sectionVariants[sectionType]} ${justifyVariants[justify]} ${heightVariants[height]}`}
        >
            <nav className='menu rounded-md'>
                <section className='menu-section gap-2'>
                    <ul className='menu-items'>{children}</ul>
                </section>
            </nav>
        </section>
    );
}
