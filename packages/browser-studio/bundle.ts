import path from 'path';
import {fileURLToPath} from 'url';
import {build} from 'bun';
import {BROWSER_STUDIO_WHISPER_TRANSFORMERS_PACKAGE} from './src/browser-studio-import-map';
import {getBrowserStudioDependencyVersionsForBuild} from './src/dev/get-dependency-versions-for-build';
import {getBrowserStudioReactRefreshFilesForBuild} from './src/dev/get-react-refresh-files-for-build';
import {getBrowserStudioSetupEnvironmentForBuild} from './src/dev/get-setup-environment-for-build';
import {getBrowserStudioWorkspacePackageExportsForBuild} from './src/dev/get-workspace-package-exports-for-build';
import {studioRenderEntryExternal} from './src/dev/studio-render-entry-external';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

console.time('Generated.');
const dependencyVersions = getBrowserStudioDependencyVersionsForBuild();
const reactRefreshFiles = getBrowserStudioReactRefreshFilesForBuild();
const setupEnvironment = getBrowserStudioSetupEnvironmentForBuild();
const workspacePackageExports =
	getBrowserStudioWorkspacePackageExportsForBuild();
// These artifacts deliberately have different linkage contracts. The preview
// entry is the compatibility fallback for custom dependency resolutions and
// mismatched releases, so its shared dependencies must remain external. The
// vendor entry is the fast path and must bundle the stable dependency graph.
const vendorOutput = await build({
	define: {'process.env.NODE_ENV': JSON.stringify('development')},
	entrypoints: ['src/browser-studio-vendor-entry.ts'],
	external: [
		'@huggingface/transformers',
		BROWSER_STUDIO_WHISPER_TRANSFORMERS_PACKAGE,
	],
	format: 'iife',
	minify: true,
	naming: '[name].mjs',
	target: 'browser',
});

if (!vendorOutput.success) {
	console.log(vendorOutput.logs.join('\n'));
	process.exit(1);
}

const vendorEntryOutput = vendorOutput.outputs.find(
	(file) => path.basename(file.path) === 'browser-studio-vendor-entry.mjs',
);
if (!vendorEntryOutput) {
	throw new Error('Browser Studio vendor entry was not generated');
}
if (
	!(await vendorEntryOutput.text()).includes(
		BROWSER_STUDIO_WHISPER_TRANSFORMERS_PACKAGE,
	)
) {
	throw new Error(
		'The Browser Studio vendor entry must preserve the private Transformers import.',
	);
}

const transformersOutput = await build({
	entrypoints: ['src/browser-studio-transformers-entry.ts'],
	format: 'esm',
	minify: true,
	naming: '[name].mjs',
	target: 'browser',
});

if (!transformersOutput.success) {
	console.log(transformersOutput.logs.join('\n'));
	process.exit(1);
}

const rspackBrowserEntry = fileURLToPath(
	import.meta.resolve('@rspack/browser'),
);
const rspackWasm = Bun.file(
	path.join(path.dirname(rspackBrowserEntry), 'rspack.wasm32-wasi.wasm'),
);
const browserStudioAssetSizes = {
	rspackWasm: rspackWasm.size,
	vendorBundle: vendorEntryOutput.size,
};
const output = await build({
	entrypoints: [
		'src/index.tsx',
		'src/browser-studio-worker.ts',
		'src/browser-studio-preview-entry.ts',
	],
	naming: '[name].mjs',
	define: {
		__BROWSER_STUDIO_ASSET_SIZES__: JSON.stringify(browserStudioAssetSizes),
		__BROWSER_STUDIO_DEPENDENCY_VERSIONS__: JSON.stringify(dependencyVersions),
		__BROWSER_STUDIO_REACT_REFRESH_FILES__: JSON.stringify(reactRefreshFiles),
		__BROWSER_STUDIO_SETUP_ENVIRONMENT__: JSON.stringify(setupEnvironment),
		__BROWSER_STUDIO_WORKSPACE_PACKAGE_EXPORTS__: JSON.stringify(
			workspacePackageExports,
		),
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
	/^[^'"\n]*\bfrom\s*["']@remotion\/(?:player|studio-shared|timeline-utils)["'];?\s*$|^\s*import\s*["']@remotion\/(?:player|studio-shared|timeline-utils)["'];?\s*$/m;

for (const file of [
	...output.outputs,
	...vendorOutput.outputs,
	...transformersOutput.outputs,
]) {
	const str = await file.text();
	if (
		!file.path.includes('browser-studio-transformers-entry') &&
		(str.includes('onnxruntime-web') || str.includes('transformers.web.js'))
	) {
		throw new Error(
			'The Browser Studio bootstrap must not bundle Transformers.js. Keep it in the lazy Transformers entry.',
		);
	}

	if (
		path.basename(file.path) === 'browser-studio-vendor-entry.mjs' &&
		externalVersionSensitiveImport.test(str)
	) {
		throw new Error(
			'Browser Studio must bundle version-sensitive workspace packages into its vendor entry so it cannot link against an incompatible published version.',
		);
	}

	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}

console.timeEnd('Generated.');
