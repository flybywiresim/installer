const defaultColors = require('tailwindcss/colors');

const colors = {
    ...defaultColors,
    ...{
        'card-bg': '#313131',
        'card-active' : '#2E995E',
        'card-inactive': '#5C5C5C',
        'text-muted': '#868686',
        'text-normal': '#FEFEFE',
    }
};

module.exports = {
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }
        },
        colors: colors
    },
    variants: {
        extend: {},
    },
    plugins: [require('@flybywiresim/tailwind-config')],
};
