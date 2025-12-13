// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue': '#2C99CE',
        'blue-hover': '#E3F2FD',
        'greyy': '#F0ECEC',
        'orange': '#ff6600',
        'green': '#689F38',
        'blue-button': '#A9CBE6',
        'green-norm':'#03C988',
      },
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' }
        },
        ping: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.5)', opacity: '0' }
        },
        fadeCircle: {
          '0%, 39%, 100%': { opacity: '0' },
          '40%': { opacity: '1' }
        }
      },
      animation: {
        spin: 'spin 1s linear infinite',
        ping: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        fadeCircle: 'fadeCircle 1.2s infinite ease-in-out both'
      }
    },
  },
  plugins: [],
};
