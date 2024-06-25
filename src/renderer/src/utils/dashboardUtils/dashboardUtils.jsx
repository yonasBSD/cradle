import QueryString from 'qs';
import pluralize from 'pluralize';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import DashboardHorizontalSection from '../../components/DashboardHorizontalSection/DashboardHorizontalSection';

/**
 * Entity object type definition.
 * @typedef {Object} Entity
 * @property {string} name - the name of the entity
 * @property {string} type - the type of the entity, e.g. 'actor', 'case', 'entry', 'metadata'
 * @property {string} [subtype] - the subtype for entities with 'entry' or 'metadata' type
 */

/**
 * Function to create a dashboard link for an entity.
 * It does not assert the correctness of the entity object.
 * Any invalid link will send the user to the '404 Not Found' Page.
 *
 * @param {Entity} entity - the entity object
 * @returns {string} - the dashboard link
 */
export const createDashboardLink = (entity) => {
    if (!entity) {
        return '/not-found';
    }

    const { name, type, subtype } = entity;

    if (!name || !type) {
        return '/not-found';
    }

    if (subtype) {
        const queryString = QueryString.stringify({ subtype: subtype }); // qs also encodes the values
        return `/dashboards/${encodeURIComponent(pluralize(type))}/${encodeURIComponent(name)}/?${queryString}`;
    }

    return `/dashboards/${encodeURIComponent(pluralize(type))}/${encodeURIComponent(name)}/`;
};

/**
 * Function to render a dashboard section with entities.
 * It creates a DashboardCard for each entity and wraps them in a DashboardHorizontalSection.
 *
 * @param {?Array.<Entity>} entities - the entities to render
 * @param {string} relatedEntitiesTitle - the title of the section
 * @returns {React.ReactElement|null}
 */
export const renderDashboardSection = (entities, relatedEntitiesTitle) => {
    if (!entities) {
        return null;
    }

    const entityCards = entities.map((entry, index) => (
        <DashboardCard
            key={index}
            name={entry.subtype ? `${entry.subtype}: ${entry.name}` : entry.name}
            link={createDashboardLink(entry)}
        />
    ));

    return (
        <DashboardHorizontalSection title={relatedEntitiesTitle}>
            {entityCards}
        </DashboardHorizontalSection>
    );
};

/**
 * Function to render a dashboard section with entities and inaccessible entities.
 * It creates a DashboardCard for each entity and wraps them in a DashboardHorizontalSection.
 * If there are inaccessible entities, a message is displayed with a button to request access.
 *
 * @param {?Array.<Entity>} entities
 * @param {?Array.<Entity>} inaccessibleEntities
 * @param {string} relatedEntitiesTitle
 * @param {string} inaccessibleEntitiesMessage
 * @param {string} requestAccessMessage
 * @param {function} handleRequestEntityAccess
 * @returns {React.ReactElement|null}
 */
export const renderDashboardSectionWithInaccessibleEntities = (
    entities,
    inaccessibleEntities,
    relatedEntitiesTitle,
    inaccessibleEntitiesMessage,
    requestAccessMessage,
    handleRequestEntityAccess,
) => {
    if (!entities) {
        return null;
    }

    const entityCards = entities.map((entity, index) => (
        <DashboardCard
            key={index}
            name={entity.name}
            link={createDashboardLink(entity)}
        />
    ));

    const inaccessibleEntitiesDiv =
        inaccessibleEntities && inaccessibleEntities.length > 0
            ? [
                  <div
                      key='inaccessible-entities'
                      className='w-full h-fit mt-1 flex flex-row justify-between items-center text-zinc-400'
                  >
                      <p>
                          {inaccessibleEntitiesMessage}
                          <span
                              className='underline cursor-pointer'
                              onClick={() =>
                                  handleRequestEntityAccess(inaccessibleEntities)
                              }
                          >
                              {requestAccessMessage}
                          </span>
                      </p>
                  </div>,
              ]
            : [];

    return (
        <DashboardHorizontalSection title={relatedEntitiesTitle}>
            {[...entityCards, ...inaccessibleEntitiesDiv]}
        </DashboardHorizontalSection>
    );
};
