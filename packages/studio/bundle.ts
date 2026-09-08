import {buildPackage} from '../.monorepo/builder';

const external = [
	'react',
	'remotion',
	'@remotion/canvas',
	'react-dom',
	'react',
	'@remotion/media-utils',
	'@remotion/studio-shared',
	'@remotion/timeline-utils',
	'@remotion/zod-types',
	'@remotion/renderer',
	'@remotion/player',
	'@remotion/renderer/client',
	'@remotion/renderer/pure',
	'@remotion/web-renderer',
	'@remotion/renderer/error-handling',
	'@jridgewell/trace-mapping',
	'zod',
	'remotion/no-react',
	'react/jsx-runtime',
	'mediabunny',
];

await buildPackage({
	// Browser Studio's fallback compiler consumes this chunk without CSS loaders.
	// Keep the theme in the lazy JS chunk instead of emitting a separate stylesheet.
	plugins: [
		{
			name: 'inline-styles',
			setup(builder) {
				builder.onLoad({filter: /\.css$/}, async ({path}) => ({
					loader: 'js',
					contents: `const style = document.createElement('style'); style.textContent = ${JSON.stringify(await Bun.file(path).text())}; document.head.appendChild(style);`,
				}));
			},
		},
	],
	formats: {
		// Keep visual controls and other singleton state shared across entry points.
		esm: 'build-shared',
		cjs: 'use-tsc',
	},
	external,
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'browser',
		},
		{
			path: 'src/renderEntry.tsx',
			target: 'browser',
			splitting: true,
		},
		{
			path: 'src/internals.ts',
			target: 'browser',
		},
		{
			path: 'src/previewEntry.tsx',
			target: 'browser',
		},
	],
});
