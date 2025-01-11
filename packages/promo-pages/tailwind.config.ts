import type {Config} from 'tailwindcss';

import {
	isolateInsideOfContainer,
	scopedPreflightStyles,
} from 'tailwindcss-scoped-preflight';

export default {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
			},
		},
	},
	plugins: [
		scopedPreflightStyles({
			isolationStrategy: isolateInsideOfContainer(
				'.remotion-tailwind-landing',
				{},
			),
		}),
	],
} satisfies Config;
