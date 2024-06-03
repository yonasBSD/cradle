/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import NoteSelector from "./NoteSelector";
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

jest.mock('../../hooks/useAuth/useAuth', () => ({
    useAuth: jest.fn().mockImplementation(() => {
        return { access: 'testToken', isAdmin: true };
    }),
}));

jest.mock('../../hooks/useNavbarContents/useNavbarContents');

const noteEntities = [
    { id: 4, name: "127.0.0.1", type: "entry", subtype: "ip" },
    { id: 5, name: "Case 1", type: "case", subtype: "" },
]

const contentObject = {
    id: 5,
    name: "Case 1",
    type: "case",
    subtype: "",
    entites: noteEntities,
    description: "Description",
    notes: [
        { id: 1, publishable: true, entities: noteEntities },
        { id: 2, publishable: true, entities: noteEntities },
        { id: 3, publishable: true, entities: noteEntities },
    ],
};

const notes = [{ id: 10, content: 'Note 1', entities: [{ id: 2, name: 'Actor 1' }, { id: 3, name: 'Case 1' }], timestamp: '2021-10-01T00:00:00Z' },]

const mockData = {
    id: 1,
    name: 'Test Case',
    description: 'This is a test case.',
    type: 'case',
    actors: [{ id: 2, name: 'Actor 1' }],
    cases: [{ id: 3, name: 'Case 1' }],
    metadata: [{ id: 4, name: 'Metadata 1' }],
    notes: notes,
};

// const queryParams = "contentObject%5Bname%5D=Sample%20Name&contentObject%5Btype%5D=Sample%20Type&contentObject%5Bsubtype%5D=Sample%20Subtype&contentObject%5Bdescription%5D=Sample%20Description&contentObject%5Bnotes%5D%5B0%5D%5Bid%5D=1&contentObject%5Bnotes%5D%5B0%5D%5Bpublishable%5D=true&contentObject%5Bnotes%5D%5B1%5D%5Bid%5D=2&contentObject%5Bnotes%5D%5B1%5D%5Bpublishable%5D=true&contentObject%5Bnotes%5D%5B2%5D%5Bid%5D=3&contentObject%5Bnotes%5D%5B2%5D%5Bpublishable%5D=true";

// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useSearchParams: jest.fn().mockImplementation(() => [
//         {
//             get: jest.fn().mockReturnValue(),
//         },
//         jest.fn(),
//     ]),
// }));


jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn().mockImplementation(() => {
        return { path: '/notes', state: mockData };
    }),
}));

test("displays the name, type, and description of the content object", () => {
    render(<MemoryRouter><NoteSelector /></MemoryRouter>);

    expect(screen.getByText("Test Case")).toBeInTheDocument();
    expect(screen.getByText("Description: This is a test case.")).toBeInTheDocument();
});

