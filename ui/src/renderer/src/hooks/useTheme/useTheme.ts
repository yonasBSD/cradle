import { useEffect, useState } from 'react';

export function useTheme() {
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }

        return true; // Dark mode by default
    };

    const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

    useEffect(() => {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (!localStorage.getItem('theme')) {
                setIsDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        // Update localStorage whenever theme changes
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    const setTheme = (theme) => {
        if (theme === 'dark' || theme === 'light') {
            setIsDarkMode(theme === 'dark');
        } else {
            console.warn('Invalid theme value. Use "dark" or "light".');
        }
    };

    return { isDarkMode, toggleTheme, setTheme };
}
