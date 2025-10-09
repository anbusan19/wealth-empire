/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Raleway', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        'raleway': ['Raleway', 'system-ui', '-apple-system', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        'lato': ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
        'numbers': ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        'body': '400',
        'subheading': '500',
        'subheading-bold': '600',
        'heading': '600',
        'heading-bold': '700',
        'button': '500',
        'label': '500',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};