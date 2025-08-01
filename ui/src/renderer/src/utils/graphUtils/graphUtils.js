import { truncateText } from '../dashboardUtils/dashboardUtils';

/**
 * preprocessData - This function is used to preprocess the raw data into a format suitable for the D3 force simulation.
 * The function is used in the GraphComponent component to preprocess the data before rendering the graph.
 * The function maps over the entries in the data and creates a new node for each entry with the necessary properties.
 * The function also calculates the degree of each node (i.e., the number of links connected to the node).
 * Labels are truncated to 40 characters.
 *
 * @function preprocessData
 * @param {
 *     {
 *          entries: Array<GraphEntry>,
 *          links: Array<GraphLink>
 *     }
 *     } data - The raw data to be preprocessed. The data should have a 'entries' property and a 'links' property.
 * @returns {
 *      {
 *          nodes: Array<GraphNode>,
 *          links: Array<GraphLink>
 *      }
 *      } The preprocessed data, containing an array of nodes and an array of links.
 */

const DEFAULT_BORDER = '#71717a';
const DEFAULT_SELECT = '#f68d2e';
const DEFAULT_RADIUS = 5;
const COLORSET = { entity: '#744abf' };

function interpolate(x1, x2, y1, y2, x) {
    if (x1 === x2) return (y1 + y2) / 2;
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

export const flattenGraphEntries = (entries) => {
    let elist = [];
    for (let et of Object.keys(entries)) {
        for (let e of entries[et]) {
            elist.push({ subtype: et, ...e });
        }
    }

    return elist;
};

export const preprocessData = (data) => {
    // Initialize an empty array for the nodes
    let nodes = [];
    // Get the links from the data
    let adjacency_map = data.links;
    let links = [];
    let indices = {};
    let c = 0;

    // Map over the entries in the data and create a new node for each entry
    nodes = data.entries.map((entry) => {
        indices[entry.id] = c++;
        return {
            id: entry.id,
            label: entry.subtype
                ? truncateText(`${entry.subtype}: ${entry.name}`, 40)
                : truncateText(`${entry.type}: ${entry.name}`, 40),
            color: data.colors[entry.subtype],
            name: entry.name,
            type: entry.type,
            subtype: entry.subtype,
            neighbors: new Set(),
            links: new Set(),
            degree: 0,
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            vx: 0,
            vy: 0,
            fx: null,
            fy: null,
        };
    });

    // Initialize an empty object to store the degrees of the nodes
    const nodesDegrees = {};

    var maxDegree = -1;
    var minDegree = Infinity;

    // Calculate the degree of each node (i.e., the number of links connected to the node)
    Object.keys(adjacency_map).forEach((src) => {
        adjacency_map[src].forEach((dst) => {
            nodesDegrees[src] = (nodesDegrees[src] || 0) + 1;
            nodesDegrees[dst] = (nodesDegrees[dst] || 0) + 1;
            nodes[indices[src]].neighbors.add(nodes[indices[dst]]);
            nodes[indices[dst]].neighbors.add(nodes[indices[src]]);
            let link = { source: src, target: dst };
            nodes[indices[src]].links.add(link);
            nodes[indices[dst]].links.add(link);
            links.push(link);
            maxDegree = Math.max(maxDegree, nodesDegrees[src], nodesDegrees[dst]);
            minDegree = Math.min(minDegree, nodesDegrees[src], nodesDegrees[dst]);
        });
    });

    // Assign the calculated degree to each node
    nodes.forEach((node) => {
        node.degree = nodesDegrees[node.id] || 0;
        node.degree_norm = interpolate(minDegree, maxDegree, 1, 2, node.degree);
    });

    // Return the preprocessed data
    return { nodes, links };
};
