import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
        'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
        'grid-move': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(60px, 60px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.8), 0 0 60px rgba(0, 217, 255, 0.3)' },
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(124, 58, 237, 0.7), 0 0 10px rgba(0, 217, 255, 0.3)',
            opacity: '0.8',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(124, 58, 237, 1), 0 0 50px rgba(0, 217, 255, 0.6)',
            opacity: '1',
          },
        },
        'card-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.3), 0 0 20px rgba(0, 217, 255, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.6), 0 0 40px rgba(0, 217, 255, 0.2)' },
        },
  		},
  		animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'grid-move': 'grid-move 20s linear infinite',
        'glow-pulse': 'glow-pulse 6s ease-in-out infinite',
        'data-flow': 'data-flow 4s ease-in-out infinite',
        'shimmer': 'shimmer 5s linear infinite',
        'border-pulse': 'border-pulse 4s ease-in-out infinite alternate',
        'card-glow': 'card-glow 4s ease-in-out infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
