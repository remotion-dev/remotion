import path from 'path';
import {fileURLToPath} from 'url';
import {build} from 'bun';
import {getBrowserStudioDependencyVersionsForBuild} from './get-dependency-versions-for-build';
import {getBrowserStudioSetupEnvironmentForBuild} from './get-setup-environment-for-build';

const port = Number(process.env.PORT ?? 62338);
const outDir = path.join(import.meta.dir, '..', '..', 'dist', 'dev');

const headers = {
	'Cross-Origin-Embedder-Policy': 'credentialless',
	'Cross-Origin-Opener-Policy': 'same-origin',
};

const contentTypes: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.wasm': 'application/wasm',
};

const indexHtml = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Remotion Browser Studio</title>
		<style>
			html,
			body,
			#root {
				height: 100%;
				margin: 0;
				width: 100%;
			}
		</style>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/index.mjs"></script>
	</body>
</html>`;

const frameHtml = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Remotion Studio Frame</title>
		<style>
			html,
			body {
				background: #111111;
				height: 100%;
				margin: 0;
				overflow: hidden;
				width: 100%;
			}
		</style>
	</head>
	<body></body>
</html>`;

const buildDevAssets = async () => {
	const dependencyVersions = getBrowserStudioDependencyVersionsForBuild();
	const setupEnvironment = getBrowserStudioSetupEnvironmentForBuild();
	const output = await build({
		entrypoints: ['src/dev/index.tsx', 'src/browser-studio-worker.ts'],
		define: {
			__BROWSER_STUDIO_DEPENDENCY_VERSIONS__:
				JSON.stringify(dependencyVersions),
			__BROWSER_STUDIO_SETUP_ENVIRONMENT__: JSON.stringify(setupEnvironment),
		},
		format: 'esm',
		naming: '[name].mjs',
		outdir: outDir,
		sourcemap: 'linked',
		target: 'browser',
	});

	if (!output.success) {
		process.stderr.write(`${output.logs.join('\n')}\n`);
		process.exit(1);
	}

	const rspackBrowserEntry = fileURLToPath(
		import.meta.resolve('@rspack/browser'),
	);
	const rspackBrowserDist = path.dirname(rspackBrowserEntry);

	for (const asset of ['rspack.wasm32-wasi.wasm', 'wasi-worker-browser.mjs']) {
		await Bun.write(
			path.join(outDir, asset),
			Bun.file(path.join(rspackBrowserDist, asset)),
		);
	}
};

const responseWithHeaders = (body: BodyInit, init?: ResponseInit): Response => {
	const responseHeaders = new Headers(init?.headers);
	for (const [key, value] of Object.entries(headers)) {
		responseHeaders.set(key, value);
	}

	return new Response(body, {
		...init,
		headers: responseHeaders,
	});
};

const start = async () => {
	await buildDevAssets();

	Bun.serve({
		port,
		async fetch(request) {
			const url = new URL(request.url);

			if (url.pathname === '/' || url.pathname === '/index.html') {
				return responseWithHeaders(indexHtml, {
					headers: {'Content-Type': contentTypes['.html']},
				});
			}

			if (url.pathname === '/frame.html') {
				return responseWithHeaders(frameHtml, {
					headers: {'Content-Type': contentTypes['.html']},
				});
			}

			const assetPath = path.join(outDir, path.normalize(url.pathname));
			if (!assetPath.startsWith(outDir)) {
				return responseWithHeaders('Not found', {status: 404});
			}

			const file = Bun.file(assetPath);
			if (!(await file.exists())) {
				return responseWithHeaders('Not found', {status: 404});
			}

			const contentType = contentTypes[path.extname(assetPath)];

			return responseWithHeaders(file, {
				headers: contentType ? {'Content-Type': contentType} : undefined,
			});
		},
	});

	process.stdout.write(`Browser Studio dev server: http://localhost:${port}\n`);
	process.stdout.write('Press Ctrl+C to stop.\n');
};

start().catch((error: unknown) => {
	process.stderr.write(
		error instanceof Error ? (error.stack ?? error.message) : `${error}`,
	);
	process.stderr.write('\n');
	process.exit(1);
});
