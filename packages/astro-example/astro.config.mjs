import react from '@astrojs/react';
import {defineConfig} from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Enable React to support React JSX components.
	integrations: [react()],
	vite: {
		build: {
			rolldownOptions: {
				tsconfig: './tsconfig.json',
			},
		},
		resolve: {
			// This example uses package imports, not monorepo tsconfig path aliases.
			tsconfigPaths: false,
		},
	},
});
