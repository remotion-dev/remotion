import {$, build} from 'bun';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const nodeVersion =
	await $`node -e "console.log(typeof structuredClone)"`.text();
if (nodeVersion.trim() === 'undefined') {
	if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
		throw new Error(
			'Error: You are using Node.js without structuredClone. Please upgrade to Node.js 17 or newer.',
		);
	} else {
		console.log(
			'Node does not have structuredClone. Passing because we are not building the site.',
		);
		process.exit(0);
	}
}

await $`bunx tailwindcss -i src/index.css -o dist/tailwind.css`;

const result = await build({
	entrypoints: [
		'./src/components/Homepage.tsx',
		'./src/components/homepage/Pricing.tsx',
		'./src/components/team.tsx',
		'./src/components/design.tsx',
		'./src/components/templates.tsx',
		'./src/components/template-modal-content.tsx',
		'./src/components/experts.tsx',
		'./src/components/experts/experts-data.tsx',
		'./src/components/prompts/PromptsGallery.tsx',
		'./src/components/prompts/PromptsSubmit.tsx',
		'./src/components/prompts/PromptsShow.tsx',
		'./src/components/prompts/prompt-types.ts',
	],
	root: './src/components',
	outdir: 'dist',
	format: 'esm',
	external: [
		'react',
		'react/jsx-runtime',
		'react-dom',
		'lottie-web',
		'hls.js',
		'plyr',
		'zod',
		'@mux/upchunk',
		'mediabunny',
		'@mediabunny/ac3',
		'@mediabunny/aac-encoder',
		'@mediabunny/flac-encoder',
		'@mediabunny/mp3-encoder',
	],
});

if (!result.success) {
	console.log(result.logs.join('\n'));
	process.exit(1);
}

const outdir = path.resolve('dist');

for (const output of result.outputs) {
	// On Windows, Bun may return absolute output paths here. Normalize them back
	// into the local dist directory so we don't accidentally write invalid paths.
	const relativeOutputPath = path.isAbsolute(output.path)
		? path.relative(outdir, output.path)
		: output.path;
	const normalizedOutputPath = relativeOutputPath.replaceAll('\\', '/');
	const outputPathWithoutDistPrefix = normalizedOutputPath.startsWith('dist/')
		? normalizedOutputPath.slice('dist/'.length)
		: normalizedOutputPath;

	if (outputPathWithoutDistPrefix.startsWith('../')) {
		throw new Error(`Unexpected build output path: ${output.path}`);
	}

	await Bun.write(path.join('dist', outputPathWithoutDistPrefix), await output.text());
}

export {};
