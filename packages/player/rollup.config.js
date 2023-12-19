// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import banner2 from 'rollup-plugin-banner2';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/esm/index.mjs',
				format: 'es',
				sourcemap: false,
			},
		],
		external: ['react', 'remotion', 'remotion/no-react', 'react/jsx-runtime'],
		plugins: [
			typescript({
				tsconfig: 'tsconfig-esm.json',
				sourceMap: false,
				outputToFilesystem: true,
			}),
			// Adds "use client;" on top of the bundle instructing React to treat the <Player />
			// and all other exported components as a client component as opposed to a server component.
			banner2(() => `"use client";\n`),
		],
	},
];
