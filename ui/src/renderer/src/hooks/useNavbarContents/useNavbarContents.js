import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * useNavbarContents hook - sets the contents of the navbar
 * Other components can use this hook to set the contents of the navbar
 * When the component is unmounted, the contents are cleared
 *
 * @param {Array<React.ReactComponent>} contents - the contents to set in the navbar
 * @param {Array<any>} dependencies - the dependencies for the effect (Set to something from the component
 *                       that uses the hook to avoid errors with React trying to
 *                       render multiple components simultaneously)
 */
const useNavbarContents = (contents, dependencies) => {
    const { setNavbarContents } = useOutletContext();

    return useEffect(() => {
        if (contents instanceof Function) {
            setNavbarContents(contents());
        } else {
            setNavbarContents([contents]);
        }

        return () => {
            setNavbarContents([]);
        };
    }, dependencies);
};

export default useNavbarContents;
