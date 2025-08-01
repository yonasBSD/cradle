// eslint-disable-next-line no-undef
const EXTENDED_COLORS = {
    cradle1: '#02111a',
    cradle2: '#f68d2e',
    cradle3: '#253746',
};

module.exports = {
    darkMode: ['selector', '[data-theme="dark"]'],
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}',
        './src/index.html',
        './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    ],
    plugins: [],
    theme: {
        extend: {
            colors: EXTENDED_COLORS,
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        lineHeight: '24px',
                        li: {
                            marginTop: '4px',
                        },
                        h1: {
                            marginTop: '16px',
                            marginBottom: '16px',
                            borderBottomWidth: '1px',
                            borderBottomColor: 'rgba(61, 68, 77, 0.7)',
                            borderBottomStyle: 'solid',
                            paddingBottom: '8px',
                        },
                        h2: {
                            marginTop: '16px',
                            marginBottom: '16px',
                            borderBottomWidth: '1px',
                            borderBottomColor: 'rgba(61, 68, 77, 0.7)',
                            borderBottomStyle: 'solid',
                            paddingBottom: '8px',
                        },
                        h3: {
                            marginTop: '16px',
                            marginBottom: '16px',
                            borderBottomWidth: '1px',
                            borderBottomColor: 'rgba(61, 68, 77, 0.7)',
                            borderBottomStyle: 'solid',
                            paddingBottom: '8px',
                        },
                        br: {
                            marginTop: '8px',
                            marginBottom: '8px',
                        },
                        hr: {
                            borderTopWidth: '3px',
                        },
                        pre: {
                            padding: theme('padding.4'),
                            overflow: 'auto !important',
                            maxWidth: '100% !important',
                        },
                        code: {
                            whiteSpace: 'pre-wrap !important',
                            wordBreak: 'break-word !important',
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwind-scrollbar'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        require('rippleui'),
        function ({ addUtilities, addBase }) {
            addUtilities({
                '.no-scrollbar': {
                    '-ms-overflow-style': 'none' /* IE and Edge */,
                    'scrollbar-width': 'none' /* Firefox */,
                },
                '.no-scrollbar::-webkit-scrollbar': {
                    display: 'none' /* Hide scrollbar for WebKit-based browsers */,
                },
            });
        },
    ],
    rippleui: {
        themes: [
            {
                themeName: 'light',
                colorScheme: 'light',
                colors: {
                    primary: '#253746',
                    backgroundPrimary: '#e8e8e8',
                    secondary: '#9984D4',
                    backgroundSecondary: '#555161',
                    white: '#ffffff',
                    ...EXTENDED_COLORS,
                },
            },
            {
                themeName: 'dark',
                colorScheme: 'dark',
                colors: {
                    primary: '#f68d2e',
                    backgroundPrimary: '#151515',
                    secondary: '#7659C5',
                    backgroundSecondary: '#555161',
                    white: '#ffffff',
                    ...EXTENDED_COLORS,
                },
            },
        ],
    },
};
