'use strict';

module.exports = {
    purge: {
        mode: 'jit',
        content: [
            './src/**/*.html',
            './src/**/*.jsx',
            './src/**/*.tsx',
        ],
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            height: {
                '450px': '450px',
            },
            width: {
                '520px': '520px',
                '700px': '700px',
            },
            spacing: {
                '14.06px': '14.06px',
                '17.01px': '17.01px',
            },
            colors: {
                'quasi-white': '#FAFAFA',
                grey:  {
                    medium: '#EDEDED',
                },
                cyan: {
                    DEFAULT: '#00E0FE',
                    medium: '#00C4F5',
                    dark: 'var(--color-brand-cyan-dark)',
                },
                dodger: {
                    light: '#00BBFF'
                },
                navy: {
                    DEFAULT: '#171E2C',
                    light: '#1F2A3C',
                    lightest: '#273347',
                    lighter: '#222c3d',
                    dark: '#0E131B',
                },
                red: {
                    DEFAULT: '#FC3A3A',
                    dark: '#F70404',
                    darker: '#E40303',
                    darkest: '#D10303',
                },
                'utility': {
                    'red': 'var(--color-utility-red)',
                    'green': 'var(--color-utility-green)',
                    'orange': 'var(--color-utility-orange)',
                    'amber': 'var(--color-utility-amber)',
                    'blue': 'var(--color-utility-blue)',
                    'purple': 'var(--color-utility-purple)',
                    'pink': 'var(--color-utility-pink)',
                    'salmon': 'var(--color-utility-salmon)',
                    'grey': 'var(--color-utility-grey)',
                    'dark-grey': 'var(--color-utility-dark-grey)',
                    'grey-blue': 'var(--color-utility-grey-blue)',
                },
            },
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            },
            animation: {
                'spin-reverse': 'spin 1s linear infinite reverse',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                'sm-md': '4px',
            },
        },
    },
    variants: {
        extend: {
            boxShadow: ['active'],
            translate: ['active'],
            brightness: ['hover', 'focus'],
            backgroundColor: ['first'],
        }
    },
    plugins: [require('@flybywiresim/tailwind-config')],
};
