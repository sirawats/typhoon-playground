import type { Config } from 'tailwindcss';

const colors = {
  primary: '#726BDF',
  secondary: '#7C7E89',
  focus: '#28204B',
  background: '#1A1B1F',
  surface: '#121215',
} as const;

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',

  theme: {
    extend: {
      colors,
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        notoSansThai: ['Noto Sans Thai', 'sans-serif'],
      },
      fontSize: {
        super: ['96px', '96px'],
        h1: ['64px', '64px'],
        h2: ['36px', '36px'],
        h3: ['24px', '24px'],
        h4: ['20px', '20px'],
        h5: ['16px', '16px'],
        h6: ['14px', '14px'],
        body1: ['18px', '20px'],
        body2: ['14px', '20px'],
        subtitle: ['12px', '12px'],
        caption: ['11px', '11px'],
        btn: ['16px', '24px'],
        'btn-sm': ['14px', '24px'],
      },
    },
  },
  plugins: [],
} satisfies Config;

export { colors };
