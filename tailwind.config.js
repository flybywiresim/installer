module.exports = {
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                navy: {
                    'lightest': '#273347',
                    'lighter': '#222c3d',
                }
            },
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }
        },
    },
    variants: {
        extend: {
            backgroundColor: ['first']
        }
    },
    plugins: [require('@flybywiresim/tailwind-config')],
};
