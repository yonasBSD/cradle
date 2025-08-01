import { Graph } from '@phosphor-icons/react';
import {
    Bell,
    BellNotification,
    DataTransferBoth,
    Edit,
    LogOut,
    Notes,
    Settings,
    UserCrown,
} from 'iconoir-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext/ProfileContext';
import useAuth from '../../hooks/useAuth/useAuth';
import useCradleNavigate from '../../hooks/useCradleNavigate/useCradleNavigate';
import SidebarItem from '../SidebarItem/SidebarItem';
import SidebarSection from '../SidebarSection/SidebarSection';

/**
 * Sidebar component - the main sidebar for the application.
 *
 * @function Sidebar
 * @param {Object} props - the props object
 * @param {boolean} props.showNotifications - determines if the notifications panel should be displayed
 * @param {number} props.unreadNotificationsNumber - the number of new notifications
 * @param {Function} props.handleNotifications - handler for the notifications action
 * @param {Function} props.handleWelcomePage - handler for navigating to the welcome page
 * @param {boolean} props.isDarkMode - determines if the current mode is dark mode
 * @param {Function} props.onThemeToggle - handler for toggling between light and dark mode
 * @returns {Sidebar}
 * @constructor
 */
export default function Sidebar({
    showNotifications,
    unreadNotificationsCount,
    handleNotifications,
    isDarkMode,
    onThemeToggle,
}) {
    const [isRightMouseDown, setIsRightMouseDown] = useState(false);
    const auth = useAuth();
    const { isEntryManager, profile } = useProfile();
    const { navigate, navigateLink } = useCradleNavigate();

    const [isHovered, setIsHovered] = useState(false);
    const isHoveredRef = useRef(isHovered);

    useEffect(() => {
        isHoveredRef.current = isHovered;
    }, [isHovered]);

    useEffect(() => {
        if (profile?.compact_mode) {
            return;
        }

        const handleMouseDown = (e) => {
            if (e.button === 0) {
                setIsRightMouseDown(!isHoveredRef.current);
            }
        };

        const handleMouseUp = (e) => {
            if (e.button === 0) {
                setIsRightMouseDown(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [profile?.compact_mode]);

    const newNoteLocation = '/editor/new';
    const handleNewNote = useCallback(navigateLink(newNoteLocation), [navigateLink]);

    const documentsLocation = '/documents';
    const handleDocuments = useCallback(navigateLink(documentsLocation), [
        navigateLink,
    ]);

    const graphViewLocation = '/knowledge-graph';
    const handleGraphView = useCallback(navigateLink(graphViewLocation), [
        navigateLink,
    ]);

    const connectivityLocation = '/connectivity';
    const handleConnectivity = useCallback(navigateLink(connectivityLocation), [
        navigateLink,
    ]);

    const accountSettingsLocation = '/account';
    const handleAccountSettings = useCallback(navigateLink(accountSettingsLocation), [
        navigateLink,
    ]);

    const adminLocation = '/admin';
    const handleAdminPanel = useCallback(navigateLink(adminLocation), [navigateLink]);

    const handleLogout = useCallback(() => {
        auth.logOut();
    }, [auth, navigate, location]);

    let notificationIconColor = showNotifications ? 'text-gray-500' : '';

    return (
        <div className='h-full sticky top-0' data-testid='sidebar-test'>
            <aside
                className={`sidebar !h-full w-14 text-gray-400 transition-all duration-300 overflow-visible group/sidebar ${
                    !profile?.compact_mode && !isRightMouseDown ? 'hover:w-48' : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className='flex flex-col h-full justify-between'>
                    <div className='flex flex-col gap-2'>
                        <SidebarSection
                            sectionType='header'
                            height='fit'
                            justify='start'
                        >
                            <SidebarItem
                                handleClick={handleNewNote}
                                icon={<Edit />}
                                text='New Note'
                                highlightedLocation={newNoteLocation}
                                compact={profile?.compact_mode}
                            />
                            <SidebarItem
                                handleClick={handleDocuments}
                                icon={<Notes />}
                                text='Documents'
                                highlightedLocation={documentsLocation}
                                compact={profile?.compact_mode}
                            />
                            <SidebarItem
                                handleClick={handleGraphView}
                                icon={<Graph height={24} width={24} />}
                                text='Graph Explorer'
                                highlightedLocation={graphViewLocation}
                                compact={profile?.compact_mode}
                            />
                            <SidebarItem
                                handleClick={handleConnectivity}
                                icon={<DataTransferBoth />}
                                text='Import/Export'
                                highlightedLocation={connectivityLocation}
                                compact={profile?.compact_mode}
                            />
                        </SidebarSection>
                    </div>
                    <SidebarSection type='footer' height='fit' justify='end'>
                        <SidebarItem
                            handleClick={handleAccountSettings}
                            icon={<Settings />}
                            text='Settings'
                            highlightedLocation={accountSettingsLocation}
                            compact={profile?.compact_mode}
                        />
                        {isEntryManager() && (
                            <SidebarSection type='content' height='fit' justify='start'>
                                <SidebarItem
                                    handleClick={handleAdminPanel}
                                    icon={<UserCrown />}
                                    text='Manage'
                                    highlightedLocation={adminLocation}
                                    compact={profile?.compact_mode}
                                />
                            </SidebarSection>
                        )}
                        {/*
                        <SidebarItem
                            handleClick={() =>
                                window.open('https://cradle.sh/docs/userguide/')
                            }
                            icon={<QuestionMark height={24} width={24} />}
                            text='User Guide'
                            highlightedLocation='_blank'
                            compact={profile?.compact_mode}
                        />
                        */}
                        <SidebarItem
                            handleClick={handleNotifications}
                            icon={
                                unreadNotificationsCount > 0 ? (
                                    <BellNotification
                                        className={notificationIconColor}
                                    />
                                ) : (
                                    <Bell className={notificationIconColor} />
                                )
                            }
                            text={`${unreadNotificationsCount} Notifications`}
                            compact={profile?.compact_mode}
                        />
                        <SidebarItem
                            handleClick={handleLogout}
                            icon={<LogOut />}
                            text='Logout'
                            compact={profile?.compact_mode}
                        />
                    </SidebarSection>
                </div>
            </aside>
        </div>
    );
}
