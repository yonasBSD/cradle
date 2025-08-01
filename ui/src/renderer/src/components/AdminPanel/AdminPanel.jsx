import { uniqueId } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext/ProfileContext';
import useCradleNavigate from '../../hooks/useCradleNavigate/useCradleNavigate';
import {
    getEntities,
    getEntryClasses,
    getUsers,
} from '../../services/adminService/adminService';
import {
    getEnrichmentTypes,
    getMappingTypes,
} from '../../services/intelioService/intelioService';
import { createDashboardLink } from '../../utils/dashboardUtils/dashboardUtils';
import { displayError } from '../../utils/responseUtils/responseUtils';
import AccountSettings from '../AccountSettings/AccountSettings';
import AdminPanelCardEnrichment from '../AdminPanelCard/AdminPanelCardEnrichment';
import AdminPanelCardEntity from '../AdminPanelCard/AdminPanelCardEntity';
import AdminPanelCardEntryType from '../AdminPanelCard/AdminPanelCardEntryType';
import AdminPanelCardManagement from '../AdminPanelCard/AdminPanelCardManagement';
import AdminPanelCardTypeMapping from '../AdminPanelCard/AdminPanelCardTypeMapping';
import AdminPanelCardUser from '../AdminPanelCard/AdminPanelCardUser';
import EntityForm from '../AdminPanelForms/EntityForm';
import EntriesSettingsForm from '../AdminPanelForms/EntriesSettingsForm';
import EntryTypeForm from '../AdminPanelForms/EntryTypeForm';
import FileSettingsForm from '../AdminPanelForms/FileSettingsForm';
import GraphSettingsForm from '../AdminPanelForms/GraphSettingsForm';
import NoteSettingsForm from '../AdminPanelForms/NoteSettingsForm';
import UserSettingsForm from '../AdminPanelForms/UserSettingsForm';
import AdminPanelSection from '../AdminPanelSection/AdminPanelSection';
import AlertDismissible from '../AlertDismissible/AlertDismissible';
import ResizableSplitPane from '../ResizableSplitPane/ResizableSplitPane';
import { Tab, Tabs } from '../Tabs/Tabs';

/**
 * AdminPanel component - This component is used to display the AdminPanel.
 * Displays the AdminPanel with tabs for:
 * - Entities
 * - Entry Types
 * - Users (admin only)
 *
 * Each tab contains a list of cards using the adjusted cards which encapsulate
 * the logic for deletion, editing, and activity navigation.
 *
 * @returns {JSX.Element} AdminPanel
 */
export default function AdminPanel() {
    const [entities, setEntities] = useState(null);
    const [mappingTypes, setMappingTypes] = useState(null);
    const [enrichmentTypes, setEnrichmentTypes] = useState(null);
    const [users, setUsers] = useState(null);
    const { isAdmin } = useProfile();
    const [entryTypes, setEntryTypes] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', color: 'red' });
    const [rightPane, setRightPane] = useState(null);
    const location = useLocation();
    const { navigate, navigateLink } = useCradleNavigate();
    const handleError = displayError(setAlert, navigate);

    const displayEntities = async () => {
        getEntities()
            .then((response) => {
                if (response.status === 200) {
                    const fetchedEntities = response.data;
                    setEntities(
                        fetchedEntities.map((c) => {
                            return (
                                <AdminPanelCardEntity
                                    id={c.id}
                                    key={`${c.subtype}:${c.name}`}
                                    name={c.name}
                                    searchKey={`${c.subtype}:${c.name} ${c.description}`}
                                    onDelete={displayEntities}
                                    link={createDashboardLink(c)}
                                    typename={c.subtype}
                                    setRightPane={setRightPane}
                                />
                            );
                        }),
                    );
                }
            })
            .catch(handleError);
    };

    const displayEntryTypes = async () => {
        getEntryClasses(true, true)
            .then((response) => {
                if (response.status === 200) {
                    const fetchedEntryTypes = response.data;
                    setEntryTypes(
                        fetchedEntryTypes.map((c) => (
                            <AdminPanelCardEntryType
                                searchKey={c.subtype}
                                id={c.subtype}
                                key={c.subtype}
                                name={c.subtype}
                                count={c.count}
                                onDelete={displayEntryTypes}
                                setRightPane={setRightPane}
                            />
                        )),
                    );
                }
            })
            .catch(handleError);
    };

    const displayUsers = async () => {
        getUsers()
            .then((response) => {
                if (response.status === 200) {
                    const fetchedUsers = response.data;
                    setUsers(
                        fetchedUsers.map((user) => (
                            <AdminPanelCardUser
                                id={user.id}
                                searchKey={user.username}
                                key={user.username}
                                name={user.username}
                                onDelete={displayUsers}
                                setRightPane={setRightPane}
                            />
                        )),
                    );
                }
            })
            .catch(handleError);
    };

    const displayMappingTypes = async () => {
        getMappingTypes()
            .then((response) => {
                if (response.status === 200) {
                    const mappingTypes = response.data;
                    setMappingTypes(
                        mappingTypes.map((x) => {
                            return (
                                <AdminPanelCardTypeMapping
                                    id={x.class_name}
                                    key={x.class_name}
                                    searchKey={x.name}
                                    name={x.name}
                                    setRightPane={setRightPane}
                                />
                            );
                        }),
                    );
                }
            })
            .catch(handleError);
    };

    const displayEnrichmentTypes = async () => {
        getEnrichmentTypes()
            .then((response) => {
                if (response.status === 200) {
                    const enrichmentTypes = response.data;
                    setEnrichmentTypes(
                        enrichmentTypes.map((x) => {
                            return (
                                <AdminPanelCardEnrichment
                                    id={x.class_name}
                                    key={x.class_name}
                                    name={x.name}
                                    setRightPane={setRightPane}
                                />
                            );
                        }),
                    );
                }
            })
            .catch(handleError);
    };

    useEffect(() => {
        if (isAdmin()) {
            displayUsers();
            displayEnrichmentTypes();
        }
        displayEntities();
        displayEntryTypes();
        displayMappingTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    return (
        <>
            <AlertDismissible alert={alert} setAlert={setAlert} />
            <div className='w-full h-full'>
                <ResizableSplitPane
                    initialSplitPosition={30} // matches the original 2/5 width
                    leftClassName='m-3'
                    leftContent={
                        <Tabs defaultTab={0} queryParam={'tab'}>
                            <Tab title='Entities'>
                                <AdminPanelSection
                                    addEnabled={isAdmin()}
                                    addTooltipText='Add Entity'
                                    handleAdd={(onAdd) =>
                                        setRightPane(
                                            <EntityForm
                                                isEdit={false}
                                                key={uniqueId('entity-form-')}
                                                onAdd={(c) => {
                                                    onAdd(
                                                        <AdminPanelCardEntity
                                                            id={c.id}
                                                            key={`${c.subtype}:${c.name}`}
                                                            name={c.name}
                                                            searchKey={`${c.subtype}:${c.name} ${c.description}`}
                                                            onDelete={displayEntities}
                                                            link={createDashboardLink(
                                                                c,
                                                            )}
                                                            typename={c.subtype}
                                                            setRightPane={setRightPane}
                                                        />,
                                                    );
                                                }}
                                            />,
                                        )
                                    }
                                    isLoading={entities === null}
                                >
                                    {entities}
                                </AdminPanelSection>
                            </Tab>
                            <Tab title='Entry Types'>
                                <AdminPanelSection
                                    addEnabled={isAdmin()}
                                    addTooltipText='Add Entry Class'
                                    handleAdd={(onAdd) =>
                                        setRightPane(
                                            <EntryTypeForm
                                                isEdit={false}
                                                key={uniqueId('entry-type-form-')}
                                                onAdd={(c) =>
                                                    onAdd(
                                                        <AdminPanelCardEntryType
                                                            searchKey={c.subtype}
                                                            id={c.subtype}
                                                            key={c.subtype}
                                                            name={c.subtype}
                                                            count={c.count}
                                                            onDelete={displayEntryTypes}
                                                            setRightPane={setRightPane}
                                                        />,
                                                    )
                                                }
                                            />,
                                        )
                                    }
                                    isLoading={entryTypes === null}
                                >
                                    {entryTypes}
                                </AdminPanelSection>
                            </Tab>
                            <Tab title='Type Mappings'>
                                <AdminPanelSection
                                    addEnabled={false}
                                    isLoading={mappingTypes === null}
                                >
                                    {mappingTypes}
                                </AdminPanelSection>
                            </Tab>
                            {isAdmin() && (
                                <Tab title='Users'>
                                    <AdminPanelSection
                                        addEnabled={true}
                                        addTooltipText='Add User'
                                        handleAdd={(onAdd) =>
                                            setRightPane(
                                                <AccountSettings
                                                    isEdit={false}
                                                    key={uniqueId('user-form-')}
                                                    onAdd={(user) =>
                                                        onAdd(
                                                            <AdminPanelCardUser
                                                                id={user.id}
                                                                searchKey={
                                                                    user.username
                                                                }
                                                                key={user.username}
                                                                name={user.username}
                                                                onDelete={displayUsers}
                                                                setRightPane={
                                                                    setRightPane
                                                                }
                                                            />,
                                                        )
                                                    }
                                                />,
                                            )
                                        }
                                        isLoading={users === null}
                                    >
                                        {users}
                                    </AdminPanelSection>
                                </Tab>
                            )}
                            {isAdmin() && (
                                <Tab title='Enrichment'>
                                    <AdminPanelSection
                                        addEnabled={false}
                                        isLoading={enrichmentTypes === null}
                                    >
                                        {enrichmentTypes}
                                    </AdminPanelSection>
                                </Tab>
                            )}
                            {isAdmin() && (
                                <Tab title='Management'>
                                    <AdminPanelSection
                                        addEnabled={false}
                                        isLoading={false}
                                    >
                                        {[
                                            <AdminPanelCardManagement
                                                id='note'
                                                key='note'
                                                setRightPane={setRightPane}
                                                name='Note Settings'
                                                SettingComponent={NoteSettingsForm}
                                            />,

                                            <AdminPanelCardManagement
                                                id='files'
                                                key='files'
                                                setRightPane={setRightPane}
                                                name='File Settings'
                                                SettingComponent={FileSettingsForm}
                                            />,
                                            <AdminPanelCardManagement
                                                id='graph'
                                                key='graph'
                                                setRightPane={setRightPane}
                                                name='Graph Settings'
                                                SettingComponent={GraphSettingsForm}
                                            />,
                                            <AdminPanelCardManagement
                                                id='entries'
                                                key='entries'
                                                setRightPane={setRightPane}
                                                name='Entry Settings'
                                                SettingComponent={EntriesSettingsForm}
                                            />,
                                            <AdminPanelCardManagement
                                                id='users'
                                                key='users'
                                                setRightPane={setRightPane}
                                                name='New User Settings'
                                                SettingComponent={UserSettingsForm}
                                            />,
                                        ]}
                                    </AdminPanelSection>
                                </Tab>
                            )}
                        </Tabs>
                    }
                    rightContent={
                        <div className='max-h-[calc(100vh-5rem)] overflow-y-auto'>
                            {rightPane}
                        </div>
                    }
                />
            </div>
        </>
    );
}
