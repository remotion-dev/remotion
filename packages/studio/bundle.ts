import {buildPackage} from '../.monorepo/builder';

const external = [
	'react',
	'remotion',
	'@remotion/sdk',
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
	'@remotion/whisper-webgpu',
	'@remotion/video-matting',
	'@remotion/renderer/error-handling',
	'@jridgewell/trace-mapping',
	'zod',
	'remotion/no-react',
	'react/jsx-runtime',
	'mediabunny',
];

const entrypoints = [
	'src/index.ts',
	'src/renderEntry.tsx',
	'src/internals.ts',
	'src/previewBootstrap.ts',
	'src/previewEntry.tsx',
];

const metafiles = await buildPackage({
	formats: {
		// Keep visual controls and other singleton state shared across entry points.
		esm: 'build-shared',
		cjs: 'use-tsc',
	},
	external,
	entrypoints: entrypoints.map((entrypoint) => ({
		path: entrypoint,
		target: 'browser',
	})),
});

if (metafiles.length !== 1) {
	throw new Error(
		'Expected the Studio build to produce a shared bundle metafile',
	);
}

const [{outputs}] = metafiles;
const entries = Object.entries(outputs).filter(
	([, output]) => output.entryPoint && entrypoints.includes(output.entryPoint),
);
if (entries.length !== entrypoints.length) {
	throw new Error(
		'Could not find all Studio entry points in the bundle metafile',
	);
}

for (const [entryPath, entry] of entries) {
	const pending = [entryPath];
	const visited = new Set<string>();
	while (pending.length > 0) {
		const outputPath = pending.pop()!;
		if (visited.has(outputPath)) continue;
		visited.add(outputPath);
		const output = outputs[outputPath];
		for (const input of Object.keys(output.inputs)) {
			if (input.replace(/\\/g, '/').split('/').includes('codemods')) {
				throw new Error(
					`Studio entry ${entry.entryPoint} eagerly bundles ${input}. Load @remotion/codemods with a dynamic import only in Browser Studio.`,
				);
			}
		}
		for (const imported of output.imports) {
			if (imported.kind === 'dynamic-import') continue;
			if (
				imported.path === '@remotion/codemods' ||
				imported.path.startsWith('@remotion/codemods/')
			) {
				throw new Error(
					`Studio entry ${entry.entryPoint} eagerly imports ${imported.path}. Load @remotion/codemods with a dynamic import only in Browser Studio.`,
				);
			}
			if (outputs[imported.path]) pending.push(imported.path);
		}
	}
}
