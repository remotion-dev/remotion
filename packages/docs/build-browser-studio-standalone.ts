import {copyFileSync, cpSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {build} from 'bun';
import {getBrowserStudioDependencyVersionsForBuild} from '../browser-studio/src/dev/get-dependency-versions-for-build';
import {getBrowserStudioReactRefreshFilesForBuild} from '../browser-studio/src/dev/get-react-refresh-files-for-build';
import {getBrowserStudioSetupEnvironmentForBuild} from '../browser-studio/src/dev/get-setup-environment-for-build';
import {getBrowserStudioWorkspacePackageExportsForBuild} from '../browser-studio/src/dev/get-workspace-package-exports-for-build';
import {getBrowserStudioWorkspaceCommit} from './get-browser-studio-workspace-commit';

const commit = getBrowserStudioWorkspaceCommit();
const browserStudioDir = path.join(import.meta.dir, '..', 'browser-studio');
const outputDir = path.join(
	import.meta.dir,
	'build',
	'assets',
	'experimental-new',
	commit,
);
const publicAssetPath = `/assets/experimental-new/${commit}`;
const dependencyVersions = getBrowserStudioDependencyVersionsForBuild();
const reactRefreshFiles = getBrowserStudioReactRefreshFilesForBuild();
const setupEnvironment = getBrowserStudioSetupEnvironmentForBuild();
const workspacePackageExports =
	getBrowserStudioWorkspacePackageExportsForBuild();

mkdirSync(outputDir, {recursive: true});

const workspaceRelativePath = path.join(
	'__remotion_browser_studio_workspace__',
	'commits',
	commit,
);
cpSync(
	path.join(import.meta.dir, 'static', workspaceRelativePath),
	path.join(import.meta.dir, 'build', workspaceRelativePath),
	{recursive: true},
);

const faviconOutputDir = path.join(import.meta.dir, 'build', 'img');
mkdirSync(faviconOutputDir, {recursive: true});
copyFileSync(
	path.join(import.meta.dir, 'static', 'img', 'favicon.png'),
	path.join(faviconOutputDir, 'favicon.png'),
);

const output = await build({
	define: {
		__BROWSER_STUDIO_DEPENDENCY_VERSIONS__: JSON.stringify(dependencyVersions),
		__BROWSER_STUDIO_REACT_REFRESH_FILES__: JSON.stringify(reactRefreshFiles),
		__BROWSER_STUDIO_SETUP_ENVIRONMENT__: JSON.stringify(setupEnvironment),
		__BROWSER_STUDIO_WORKSPACE_COMMIT__: JSON.stringify(commit),
		__BROWSER_STUDIO_WORKSPACE_PACKAGE_EXPORTS__: JSON.stringify(
			workspacePackageExports,
		),
		'process.env.NODE_ENV': JSON.stringify('production'),
	},
	entrypoints: [
		path.join(import.meta.dir, 'standalone', 'experimental-new', 'index.tsx'),
		path.join(browserStudioDir, 'src', 'browser-studio-worker.ts'),
	],
	format: 'esm',
	minify: true,
	naming: '[name].mjs',
	outdir: outputDir,
	target: 'browser',
});

if (!output.success) {
	throw new Error(output.logs.join('\n'));
}

await Bun.write(
	path.join(outputDir, 'browser-studio-vendor-entry.mjs'),
	Bun.file(
		path.join(
			browserStudioDir,
			'dist',
			'esm',
			'browser-studio-vendor-entry.mjs',
		),
	),
);

const rspackBrowserDist = path.join(
	browserStudioDir,
	'node_modules',
	'@rspack',
	'browser',
	'dist',
);
for (const asset of ['rspack.wasm32-wasi.wasm', 'wasi-worker-browser.mjs']) {
	await Bun.write(
		path.join(outputDir, asset),
		Bun.file(path.join(rspackBrowserDist, asset)),
	);
}

const html = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>New Remotion Project</title>
		<link rel="icon" href="/img/favicon.png" />
		<style>
			html,
			body,
			#root {
				background: #111111;
				height: 100%;
				margin: 0;
				overflow: hidden;
				width: 100%;
			}
		</style>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="${publicAssetPath}/index.mjs"></script>
	</body>
</html>
`;

await Bun.write(
	path.join(import.meta.dir, 'build', 'experimental_new', 'index.html'),
	html,
);

process.stdout.write(
	`Built standalone Browser Studio at /experimental_new with ${output.outputs.length + 4} assets.\n`,
);
