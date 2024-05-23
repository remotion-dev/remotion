import {build, semver, version} from 'bun';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

if (!semver.satisfies(version, '^1.1.7')) {
	// eslint-disable-next-line no-console
	console.error(
		`There is a bug with bundling when using Bun <1.1.7. You use ${version}. Please use a newer version`,
	);
	process.exit(1);
}

const output = await build({
	entrypoints: ['src/index.ts'],
	naming: '[name].mjs',
	target: 'browser',
	external: ['remotion', 'remotion/no-react', 'react', 'react-dom'],
});

const [file] = output.outputs;
const text = await file.text();
await Bun.write('dist/esm/index.mjs', text);

const versionOutput = await build({
	entrypoints: ['src/version.ts'],
	naming: '[name].mjs',
	target: 'browser',
});

const [versionFile] = versionOutput.outputs;
await Bun.write('dist/esm/version.mjs', await versionFile.text());

const noReactOutput = await build({
	entrypoints: ['src/no-react.ts'],
	naming: '[name].mjs',
	target: 'browser',
	external: ['remotion', 'react', 'react-dom'],
});
const [noReactFile] = noReactOutput.outputs;
await Bun.write('dist/esm/no-react.mjs', await noReactFile.text());

export {};
