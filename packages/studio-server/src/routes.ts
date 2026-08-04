import fs, {createWriteStream} from 'fs';
import {createReadStream, existsSync, statSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path, {join} from 'node:path';
import {URLSearchParams} from 'node:url';
import {BundlerInternals} from '@remotion/bundler';
import type {
	DefaultCodingAgent,
	DefaultEditor,
	LogLevel,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApiRoutes,
	GitSource,
	RenderDefaults,
	RenderJob,
	StudioRuntimeConfig,
} from '@remotion/studio-shared';
import {getProjectName} from '@remotion/studio-shared';
import {focusBrowserTab} from './better-opn';
import {getCompletedClientRenders} from './client-render-queue';
import {getFileSource} from './helpers/get-file-source';
import {getInstalledInstallablePackages} from './helpers/get-installed-installable-packages';
import {resolveOutputPath} from './helpers/resolve-output-path';
import {allApiRoutes} from './preview-server/api-routes';
import type {ApiHandler, QueueMethods} from './preview-server/api-types';
import {getPackageManager} from './preview-server/get-package-manager';
import {getStaticFileFallbackHint} from './preview-server/get-static-file-fallback-hint';
import {handleRequest} from './preview-server/handler';
import type {LiveEventsServer} from './preview-server/live-events';
import {fetchFolder, getFiles} from './preview-server/public-folder';
import {getEditorName} from './preview-server/routes/open-in-editor';
import {serveStatic} from './preview-server/serve-static';
import {handleStudioProtocolDiscovery} from './preview-server/studio-protocol/handle-discovery';
import {handleStudioProtocolInstall} from './preview-server/studio-protocol/handle-install';
import {handleStudioProtocolLicenseKey} from './preview-server/studio-protocol/handle-license-key';
import {handleStudioProtocolOptions} from './preview-server/studio-protocol/origin-policy';
import {validateSameOrigin} from './preview-server/validate-same-origin';
import {reloadPreviouslySuppressedFiles} from './preview-server/watch-ignore-next-change';
import type {RemotionConfigResponse} from './remotion-config-response';
const loggedStaticFileHints = new Set<string>();

const static404 = (response: ServerResponse): Promise<void> => {
	response.writeHead(404);
	response.end(
		'The static/ prefix has been changed, this URL is no longer valid.',
	);
	return Promise.resolve();
};

const output404 = (response: ServerResponse): Promise<void> => {
	response.writeHead(404);
	response.end(
		'The outputs/ prefix has been changed, this URL is no longer valid.',
	);
	return Promise.resolve();
};

const handleRemotionConfig = (
	response: ServerResponse,
	remotionRoot: string,
): Promise<void> => {
	response.writeHead(200, {
		'Content-Type': 'application/json',
	});
	const body: RemotionConfigResponse = {
		isRemotion: true,
		cwd: remotionRoot,
		version: process.env.REMOTION_VERSION ?? null,
	};
	response.end(JSON.stringify(body));
	return Promise.resolve();
};

const handleFallback = async ({
	remotionRoot,
	hash,
	response,
	request,
	getCurrentInputProps,
	getEnvVariables,
	publicDir,
	getRenderQueue,
	getRenderDefaults,
	getNumberOfAudioTags,
	getAudioLatencyHint,
	getPreviewSampleRate,
	gitSource,
	logLevel,
	enableCrossSiteIsolation,
	getStudioRuntimeConfig,
	getDefaultEditor,
}: {
	remotionRoot: string;
	hash: string;
	response: ServerResponse;
	request: IncomingMessage;
	publicDir: string;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	getRenderQueue: () => RenderJob[];
	getRenderDefaults: () => RenderDefaults;
	getNumberOfAudioTags: () => number;
	getAudioLatencyHint: () => AudioContextLatencyCategory | null;
	getPreviewSampleRate: () => number | null;
	gitSource: GitSource | null;
	logLevel: LogLevel;
	enableCrossSiteIsolation: boolean;
	getStudioRuntimeConfig: () => StudioRuntimeConfig;
	getDefaultEditor: () => DefaultEditor | null;
}) => {
	const acceptsHtml = (request.headers.accept ?? '').includes('text/html');
	if (request.method === 'GET' && acceptsHtml) {
		await reloadPreviouslySuppressedFiles();
	}

	const requestUrl = new URL(request.url as string, 'http://localhost');
	const {pathname} = requestUrl;
	const staticFileHint = getStaticFileFallbackHint({
		method: request.method,
		pathname,
		publicDir,
	});
	if (
		staticFileHint &&
		pathname.includes('.') &&
		!loggedStaticFileHints.has(staticFileHint)
	) {
		loggedStaticFileHints.add(staticFileHint);
		RenderInternals.Log.error(
			{indent: false, logLevel},
			[
				`"${pathname}" was requested but not found.`,
				'To import assets from the public/ folder, you must wrap them in staticFile(): https://www.remotion.dev/docs/assets',
				`Change \`"${pathname}"\` to \`staticFile("${pathname}")\` to fix the error.`,
			].join('\n'),
		);
	}

	const displayName = await getEditorName({getDefaultEditor, logLevel});

	response.setHeader('content-type', 'text/html');
	if (enableCrossSiteIsolation) {
		response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
		response.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
	}

	const packageManager = getPackageManager({
		remotionRoot,
		packageManager: undefined,
		dirUp: 0,
		logLevel,
	});
	fetchFolder({publicDir, staticHash: hash});

	const installedDependencies = getInstalledInstallablePackages(remotionRoot);

	response.end(
		BundlerInternals.indexHtml({
			staticHash: hash,
			publicPath: '/',
			editorName: displayName,
			envVariables: getEnvVariables(),
			inputProps: getCurrentInputProps(),
			remotionRoot,
			studioServerCommand:
				packageManager === 'unknown' ? null : packageManager.startCommand,
			renderQueue: getRenderQueue(),
			completedClientRenders: getCompletedClientRenders(),
			numberOfAudioTags: getNumberOfAudioTags(),
			publicFiles: getFiles(),
			includeFavicon: true,
			title: 'Remotion Studio',
			renderDefaults: getRenderDefaults(),
			publicFolderExists: existsSync(publicDir) ? publicDir : null,
			fileSystemPlatform: process.platform,
			gitSource,
			projectName: getProjectName({
				basename: path.basename,
				gitSource,
				resolvedRemotionRoot: remotionRoot,
			}),
			installedDependencies,
			packageManager:
				packageManager === 'unknown' ? 'unknown' : packageManager.manager,
			logLevel,
			mode: 'dev',
			audioLatencyHint: getAudioLatencyHint() ?? 'playback',
			sampleRate: getPreviewSampleRate(),
			studioRuntimeConfig: getStudioRuntimeConfig(),
		}),
	);
};

const handleFileSource = async ({
	method,
	remotionRoot,
	search,
	response,
	request,
}: {
	method: string;
	remotionRoot: string;
	search: string;
	response: ServerResponse;
	request: IncomingMessage;
}): Promise<void> => {
	if (method === 'OPTIONS') {
		response.writeHead(200);
		response.end();
		return Promise.resolve();
	}

	validateSameOrigin(request);

	if (!search.startsWith('?')) {
		throw new Error('query must start with ?');
	}

	const query = new URLSearchParams(search);
	const f = query.get('f');
	if (typeof f !== 'string') {
		throw new Error('must pass `f` parameter');
	}

	const data = await getFileSource(remotionRoot, decodeURIComponent(f));
	response.writeHead(200);
	response.write(data);
	response.end();
	return Promise.resolve();
};

const handleAddAsset = ({
	req,
	res,
	search,
	publicDir,
}: {
	req: IncomingMessage;
	res: ServerResponse;
	search: string;
	publicDir: string;
}): Promise<void> => {
	try {
		validateSameOrigin(req);

		const query = new URLSearchParams(search);

		const filePath = query.get('filePath');
		if (typeof filePath !== 'string') {
			throw new Error('No `filePath` provided');
		}

		const absolutePath = path.join(publicDir, filePath);

		const relativeToPublicDir = path.relative(publicDir, absolutePath);
		if (relativeToPublicDir.startsWith('..')) {
			throw new Error(`Not allowed to write to ${relativeToPublicDir}`);
		}

		fs.mkdirSync(path.dirname(absolutePath), {recursive: true});

		const writeStream = createWriteStream(absolutePath);
		writeStream.on('close', () => {
			res.end(JSON.stringify({success: true}));
		});

		req.pipe(writeStream);
	} catch (err) {
		res.statusCode = 500;
		res.end(JSON.stringify({error: (err as Error).message}));
	}

	return Promise.resolve();
};

const handleUploadOutput = ({
	req,
	res,
	search,
	remotionRoot,
}: {
	req: IncomingMessage;
	res: ServerResponse;
	search: string;
	remotionRoot: string;
}): Promise<void> => {
	try {
		validateSameOrigin(req);

		const query = new URLSearchParams(search);

		const filePath = query.get('filePath');
		if (typeof filePath !== 'string') {
			throw new Error('No `filePath` provided');
		}

		const absolutePath = resolveOutputPath(remotionRoot, filePath);

		fs.mkdirSync(path.dirname(absolutePath), {recursive: true});

		const writeStream = createWriteStream(absolutePath);
		writeStream.on('close', () => {
			res.end(JSON.stringify({success: true}));
		});

		writeStream.on('error', (err) => {
			res.statusCode = 500;
			res.end(JSON.stringify({error: err.message}));
		});

		req.on('error', (err) => {
			writeStream.destroy();
			res.statusCode = 500;
			res.end(JSON.stringify({error: err.message}));
		});

		req.pipe(writeStream);
	} catch (err) {
		res.statusCode = 500;
		res.end(JSON.stringify({error: (err as Error).message}));
	}

	return Promise.resolve();
};

const handleFavicon = (
	_: IncomingMessage,
	response: ServerResponse,
): Promise<void> => {
	const filePath = path.join(__dirname, '..', 'web', 'favicon.png');
	const stat = statSync(filePath);

	response.writeHead(200, {
		'Content-Type': 'image/png',
		'Content-Length': stat.size,
	});

	const readStream = createReadStream(filePath);
	readStream.pipe(response);
	return Promise.resolve();
};

const handleBeep = (
	_: IncomingMessage,
	response: ServerResponse,
): Promise<void> => {
	const filePath = path.join(__dirname, '..', 'web', 'beep.wav');
	const stat = statSync(filePath);

	response.writeHead(200, {
		'Content-Type': 'audio/wav',
		'Content-Length': stat.size,
	});

	const readStream = createReadStream(filePath);
	readStream.pipe(response);
	return Promise.resolve();
};

export const handleRoutes = ({
	staticHash,
	staticHashPrefix,
	outputHash,
	outputHashPrefix,
	request,
	response,
	liveEventsServer,
	getCurrentInputProps,
	getEnvVariables,
	remotionRoot,
	entryPoint,
	publicDir,
	logLevel,
	getRenderQueue,
	getRenderDefaults,
	getNumberOfAudioTags,
	queueMethods: methods,
	gitSource,
	binariesDirectory,
	getAudioLatencyHint,
	getPreviewSampleRate,
	enableCrossSiteIsolation,
	getStudioRuntimeConfig,
	getDefaultCodingAgent,
	getDefaultEditor,
	configFile,
}: {
	staticHash: string;
	staticHashPrefix: string;
	outputHash: string;
	outputHashPrefix: string;
	request: IncomingMessage;
	response: ServerResponse;
	liveEventsServer: LiveEventsServer;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	remotionRoot: string;
	entryPoint: string;
	publicDir: string;
	logLevel: LogLevel;
	getRenderQueue: () => RenderJob[];
	getRenderDefaults: () => RenderDefaults;
	getNumberOfAudioTags: () => number;
	queueMethods: QueueMethods;
	gitSource: GitSource | null;
	binariesDirectory: string | null;
	getAudioLatencyHint: () => AudioContextLatencyCategory | null;
	getPreviewSampleRate: () => number | null;
	enableCrossSiteIsolation: boolean;
	getStudioRuntimeConfig: () => StudioRuntimeConfig;
	getDefaultCodingAgent: () => DefaultCodingAgent | null;
	getDefaultEditor: () => DefaultEditor | null;
	configFile: string | null;
}): Promise<void> => {
	const url = new URL(request.url as string, 'http://localhost');

	if (url.pathname === '/api/file-source') {
		return handleFileSource({
			remotionRoot,
			search: url.search,
			method: request.method as string,
			response,
			request,
		});
	}

	if (url.pathname === `${staticHash}/api/add-asset`) {
		return handleAddAsset({
			req: request,
			res: response,
			search: url.search,
			publicDir,
		});
	}

	if (url.pathname === '/api/upload-output') {
		return handleUploadOutput({
			req: request,
			res: response,
			search: url.search,
			remotionRoot,
		});
	}

	if (
		url.pathname === '/api/studio-protocol' ||
		url.pathname === '/api/studio-protocol/install' ||
		url.pathname === '/api/studio-protocol/license-key'
	) {
		if (request.method === 'OPTIONS') {
			return handleStudioProtocolOptions({
				licenseKey: url.pathname === '/api/studio-protocol/license-key',
				request,
				response,
			});
		}

		if (url.pathname === '/api/studio-protocol') {
			return handleStudioProtocolDiscovery({
				gitSource,
				liveEventsServer,
				remotionRoot,
				request,
				response,
			});
		}

		if (url.pathname === '/api/studio-protocol/license-key') {
			return handleStudioProtocolLicenseKey({
				configFile,
				focusStudioTab: (studioUrl) => {
					focusBrowserTab({url: studioUrl}).catch(() => undefined);
				},
				liveEventsServer,
				request,
				response,
			});
		}

		return handleStudioProtocolInstall({
			focusStudioTab: (studioUrl) => {
				focusBrowserTab({url: studioUrl}).catch(() => undefined);
			},
			liveEventsServer,
			request,
			response,
		});
	}

	for (const [key, value] of Object.entries(allApiRoutes)) {
		if (url.pathname === key) {
			return handleRequest({
				remotionRoot,
				entryPoint,
				handler: value as ApiHandler<
					ApiRoutes[keyof ApiRoutes]['Request'],
					ApiRoutes[keyof ApiRoutes]['Response']
				>,
				request,
				response,
				logLevel,
				methods,
				binariesDirectory,
				publicDir,
				configFile,
				getDefaultCodingAgent,
				getDefaultEditor,
			});
		}
	}

	if (url.pathname === '/favicon.ico') {
		return handleFavicon(request, response);
	}

	if (url.pathname === '/beep.wav') {
		return handleBeep(request, response);
	}

	if (url.pathname === '/__remotion_config') {
		return handleRemotionConfig(response, remotionRoot);
	}

	if (url.pathname === '/events') {
		return liveEventsServer.router(request, response);
	}

	if (url.pathname.startsWith(staticHash)) {
		const filename = new URL(
			request.url as string,
			'http://localhost',
		).pathname.replace(new RegExp(`^${staticHash}`), '');
		const filePath = join(publicDir, decodeURIComponent(filename));

		return serveStatic({
			root: publicDir,
			path: filePath,
			req: request,
			res: response,
			allowOutsidePublicFolder: false,
		});
	}

	if (url.pathname.startsWith(staticHashPrefix)) {
		return static404(response);
	}

	if (url.pathname.startsWith(outputHash)) {
		const filename = new URL(
			request.url as string,
			'http://localhost',
		).pathname.replace(new RegExp(`^${outputHash}`), '');
		const filePath = join(remotionRoot, decodeURIComponent(filename));

		return serveStatic({
			root: remotionRoot,
			path: filePath,
			req: request,
			res: response,
			allowOutsidePublicFolder: false,
		});
	}

	if (url.pathname.startsWith(outputHashPrefix)) {
		return output404(response);
	}

	return handleFallback({
		remotionRoot,
		hash: staticHash,
		response,
		request,
		getCurrentInputProps,
		getEnvVariables,
		publicDir,
		getRenderQueue,
		getRenderDefaults,
		getNumberOfAudioTags,
		gitSource,
		logLevel,
		getAudioLatencyHint,
		getPreviewSampleRate,
		enableCrossSiteIsolation,
		getStudioRuntimeConfig,
		getDefaultEditor,
	});
};
