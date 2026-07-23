import {build} from 'bun';
import path from 'path';
import {getBrowserStudioDependencyVersionsForBuild} from './src/dev/get-dependency-versions-for-build';
import {getBrowserStudioSetupEnvironmentForBuild} from './src/dev/get-setup-environment-for-build';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

console.time('Generated.');
const dependencyVersions = getBrowserStudioDependencyVersionsForBuild();
const setupEnvironment = getBrowserStudioSetupEnvironmentForBuild();
const output = await build({
	entrypoints: ['src/index.tsx', 'src/browser-studio-worker.ts'],
	naming: '[name].mjs',
	define: {
		__BROWSER_STUDIO_DEPENDENCY_VERSIONS__: JSON.stringify(dependencyVersions),
		__BROWSER_STUDIO_SETUP_ENVIRONMENT__: JSON.stringify(setupEnvironment),
	},
	external: [
		'@remotion/studio-shared/define-plugin-definitions',
		'@remotion/studio-shared/studio-entry-points',
		'@remotion/studio-shared/studio-html',
		'@rspack/browser',
		'react',
		'react-dom',
		'react/jsx-runtime',
		'react/jsx-dev-runtime',
	],
});

if (!output.success) {
	console.log(output.logs.join('\n'));
	process.exit(1);
}

for (const file of output.outputs) {
	const str = await file.text();
	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}

console.timeEnd('Generated.');
