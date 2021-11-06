'use strict';

const reactComponentsSafeList = require('@flybywiresim/react-components/build/usedCSSClasses.json');

module.exports = {
    purge: {
        options: { safelist: [...reactComponentsSafeList] },
        content: [
            './src/**/*.html',
            './src/**/*.jsx',
            './src/**/*.tsx',
        ],
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            borderRadius: {
                '5px': '5px',
            },
            height: {
                '450px': '450px',
              },
            width: {
                '520px': '520px',
                '700px': '700px',
              },
            inset: {
                '3.5': '0.875rem',
                '-3.5': '-0.875rem',
                '4.5': '1.125rem',
                '-4.5': '-1.125rem',
                '5.5': '1.375rem',
                '-5.5': '-1.375rem',
                '6.5': '1.625rem',
                '-6.5': '-1.625rem',
                '7.5': '1.875rem',
                '-7.5': '-1.875rem',
                '8.5': '2.1725rem',
                '-8.5': '-2.125rem',
                '9.5': '2.375rem',
                '-9.5': '-2.375rem',
            },
            colors: {
                navy: {
                    'lightest': '#273347',
                    'lighter': '#222c3d',
                },
                red: {
                    'DEFAULT': '#FC3A3A',
                    'dark': '#F70404',
                    'darker': '#E40303',
                    'darkest': "#D10303",
                    'light': '#FC4E4E',
                },
                pink: {
                    'DEFAULT': '#BC05E1',
                    'light': '#C31EE4'
                },
                orange: {
                    'DEFAULT': '#FA8C16',
                    'light': '#FB982D',
                },
                green: {
                    'DEFAULT': '#00B853',
                    'light': '#1ABF64',
                },
                mutedGreen: {
                    'DEFAULT': '#2E995E',
                    'light': '#43A36E'
                },
                disabled: {
                    'DEFAULT': '#2E3236',
                }
            },
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            },
            animation: {
                'spin-reverse': 'spin 1s linear infinite reverse',
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ['first']
        }
    },
    plugins: [require('@flybywiresim/tailwind-config')],
};
