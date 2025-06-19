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
          lighter: '#FFF4F3',
          hover: '#E06666',
          dark: '#D93025',
        },
        surface: {
          white: '#FFFFFF',
          light: '#FAFAFA',
          lighter: '#F8F8F8',
        },
        placeholder: '#A0A0A0',
        skeleton: {
          base: '#EFEFEF',
          highlight: '#F5F5F5',
          lowlight: '#E0E0E0',
        },
        border: {
          light: '#E5E7EB',
          focus: '#F28B82',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(242, 139, 130, 0.15)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        'standard': '6px',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}
