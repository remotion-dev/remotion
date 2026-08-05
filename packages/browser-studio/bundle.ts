import path from 'path';
import {build} from 'bun';
import {getBrowserStudioDependencyVersionsForBuild} from './src/dev/get-dependency-versions-for-build';
import {getBrowserStudioReactRefreshFilesForBuild} from './src/dev/get-react-refresh-files-for-build';
import {getBrowserStudioSetupEnvironmentForBuild} from './src/dev/get-setup-environment-for-build';
import {studioRenderEntryExternal} from './src/dev/studio-render-entry-external';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

console.time('Generated.');
const dependencyVersions = getBrowserStudioDependencyVersionsForBuild();
const reactRefreshFiles = getBrowserStudioReactRefreshFilesForBuild();
const setupEnvironment = getBrowserStudioSetupEnvironmentForBuild();
const output = await build({
	entrypoints: [
		'src/index.tsx',
		'src/browser-studio-worker.ts',
		'src/browser-studio-preview-entry.ts',
	],
	naming: '[name].mjs',
	define: {
		__BROWSER_STUDIO_DEPENDENCY_VERSIONS__: JSON.stringify(dependencyVersions),
		__BROWSER_STUDIO_REACT_REFRESH_FILES__: JSON.stringify(reactRefreshFiles),
		__BROWSER_STUDIO_SETUP_ENVIRONMENT__: JSON.stringify(setupEnvironment),
	},
	external: [
		'@remotion/studio-shared/studio-entry-points',
		'@remotion/studio-shared/studio-html',
		'@rspack/browser',
		...studioRenderEntryExternal,
	],
});

if (!output.success) {
	console.log(output.logs.join('\n'));
	process.exit(1);
}

const externalVersionSensitiveImport =
	/^[^'"\n]*\bfrom\s*["']@remotion\/(?:player|studio-shared)["'];?\s*$|^\s*import\s*["']@remotion\/(?:player|studio-shared)["'];?\s*$/m;

for (const file of output.outputs) {
	const str = await file.text();
	if (
		path.basename(file.path) === 'browser-studio-preview-entry.mjs' &&
		externalVersionSensitiveImport.test(str)
	) {
		throw new Error(
			'Browser Studio must bundle version-sensitive workspace packages into its preview entry so it cannot link against an incompatible published version.',
		);
	}

	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}

console.timeEnd('Generated.');
