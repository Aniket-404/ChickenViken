/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F28B82',
          light: '#FEECEA',
          hover: '#E06666',
          dark: '#D93025',
        },
        placeholder: '#A0A0A0',
        skeleton: {
          base: '#EFEFEF',
          highlight: '#F5F5F5',
          lowlight: '#E0E0E0',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'focus': '0 0 0 3px rgba(242, 139, 130, 0.25)',
      },
      borderRadius: {
        'standard': '6px',
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}
