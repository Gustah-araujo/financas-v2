import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                primary: colors.blue,
                secondary: colors.slate,
                success: {
                    50: '#f0fdf4',
                    200: '#bbf7d0',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                },
                warning: {
                    50: '#fffbeb',
                    200: '#fde68a',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                },
                danger: {
                    50: '#fef2f2',
                    200: '#fecaca',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
            },
            borderRadius: {
                sm: '0.25rem',
                md: '0.375rem',
                lg: '0.5rem',
                xl: '0.75rem',
            },
        },
    },

    plugins: [forms],
};
