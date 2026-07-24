import fs, {createWriteStream} from 'fs';
import {createReadStream, existsSync, statSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path, {join} from 'node:path';
import {URLSearchParams} from 'node:url';
import {BundlerInternals} from '@remotion/bundler';
import {DragAndDropInternals} from '@remotion/drag-and-drop';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApiRoutes,
	ElementInstallRequest,
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
import {
	ELEMENT_INSTALL_TARGET_MAX_AGE,
	getElementInstallTarget,
} from './preview-server/element-install-state';
import {getPackageManager} from './preview-server/get-package-manager';
import {getStaticFileFallbackHint} from './preview-server/get-static-file-fallback-hint';
import {handleRequest} from './preview-server/handler';
import type {LiveEventsServer} from './preview-server/live-events';
import {parseRequestBody} from './preview-server/parse-body';
import {fetchFolder, getFiles} from './preview-server/public-folder';
import {getEditorName} from './preview-server/routes/open-in-editor';
import {serveStatic} from './preview-server/serve-static';
import {validateSameOrigin} from './preview-server/validate-same-origin';
import {reloadPreviouslySuppressedFiles} from './preview-server/watch-ignore-next-change';
import type {RemotionConfigResponse} from './remotion-config-response';
const loggedStaticFileHints = new Set<string>();
const ELEMENT_INSTALL_FOCUS_MAX_AGE = 5 * 60 * 1000;
const ELEMENT_INSTALL_TARGET_RESPONSE_WAIT = 250;

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

const isAllowedElementInstallOrigin = (origin: string | undefined) => {
	if (!origin) {
		return false;
	}

	try {
		const url = new URL(origin);
		return (
			(url.protocol === 'https:' &&
				(url.hostname === 'remotion.dev' ||
					url.hostname === 'www.remotion.dev')) ||
			(url.protocol === 'http:' &&
				(url.hostname === 'localhost' || url.hostname === '127.0.0.1'))
		);
	} catch {
		return false;
	}
};

const setElementInstallCorsHeaders = ({
	request,
	response,
}: {
	request: IncomingMessage;
	response: ServerResponse;
}) => {
	const {origin} = request.headers;
	if (isAllowedElementInstallOrigin(origin)) {
		response.setHeader('Access-Control-Allow-Origin', origin as string);
		response.setHeader('Vary', 'Origin');
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		response.setHeader('Access-Control-Max-Age', '600');
		response.setHeader('Access-Control-Allow-Private-Network', 'true');
	}
};

const handleElementInstallOptions = ({
	request,
	response,
}: {
	request: IncomingMessage;
	response: ServerResponse;
}) => {
	setElementInstallCorsHeaders({request, response});
	response.writeHead(
		isAllowedElementInstallOrigin(request.headers.origin) ? 204 : 403,
	);
	response.end();
	return Promise.resolve();
};

const handleElementInstallTarget = ({
	liveEventsServer,
	request,
	response,
	remotionRoot,
	gitSource,
}: {
	liveEventsServer: LiveEventsServer;
	request: IncomingMessage;
	response: ServerResponse;
	remotionRoot: string;
	gitSource: GitSource | null;
}) => {
	if (!isAllowedElementInstallOrigin(request.headers.origin)) {
		response.writeHead(403);
		response.end(
			JSON.stringify({success: false, reason: 'Origin not allowed'}),
		);
		return Promise.resolve();
	}

	const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

	liveEventsServer.sendEventToClient({
		type: 'request-element-install-target',
		requestId,
	});

	return new Promise<void>((resolve) => {
		setTimeout(() => {
			const target = getElementInstallTarget(requestId);
			const now = Date.now();
			const targetIsLive =
				target !== null &&
				now - target.updatedAt < ELEMENT_INSTALL_TARGET_MAX_AGE;
			const host = request.headers.host ?? null;
			const port = host?.split(':').at(-1) ?? null;
			setElementInstallCorsHeaders({request, response});
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(
				JSON.stringify({
					type: 'remotion-studio',
					projectName: getProjectName({
						basename: path.basename,
						gitSource,
						resolvedRemotionRoot: remotionRoot,
					}),
					port: port === null ? null : Number(port),
					lastFocusedAt: target?.lastFocusedAt ?? null,
					canInstall: target !== null && target.canInstall && targetIsLive,
					activeCompositionId: target?.compositionId ?? null,
					readOnly: target?.readOnly ?? false,
				}),
			);
			resolve();
		}, ELEMENT_INSTALL_TARGET_RESPONSE_WAIT);
	});
};

const handleRequestElementInstall = async ({
	liveEventsServer,
	request,
	response,
}: {
	liveEventsServer: LiveEventsServer;
	request: IncomingMessage;
	response: ServerResponse;
}) => {
	if (!isAllowedElementInstallOrigin(request.headers.origin)) {
		response.writeHead(403);
		response.end(
			JSON.stringify({success: false, reason: 'Origin not allowed'}),
		);
		return;
	}

	setElementInstallCorsHeaders({request, response});
	response.setHeader('Content-Type', 'application/json');

	try {
		const body = await parseRequestBody(request);
		const {mimeType, payload} = body as {
			mimeType?: unknown;
			payload?: unknown;
		};
		const parsed =
			typeof mimeType === 'string' && typeof payload === 'string'
				? DragAndDropInternals.parseDragData({mimeType, payload})
				: null;

		if (parsed?.type !== 'element') {
			response.writeHead(400);
			response.end(
				JSON.stringify({success: false, reason: 'Invalid Element payload'}),
			);
			return;
		}

		const target = getElementInstallTarget(null);
		const now = Date.now();
		const targetIsLive =
			target !== null &&
			now - target.updatedAt < ELEMENT_INSTALL_TARGET_MAX_AGE;
		const targetWasRecentlyFocused =
			target !== null &&
			target.lastFocusedAt !== null &&
			now - target.lastFocusedAt < ELEMENT_INSTALL_FOCUS_MAX_AGE;
		if (
			target === null ||
			!target.canInstall ||
			target.compositionFile === null ||
			target.compositionId === null ||
			!targetIsLive ||
			!targetWasRecentlyFocused
		) {
			response.writeHead(409);
			response.end(
				JSON.stringify({
					success: false,
					reason: 'No focused writable Remotion Studio composition',
				}),
			);
			return;
		}

		const installRequest: ElementInstallRequest = {
			id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
			clientId: target.clientId,
			createdAt: Date.now(),
			compositionFile: target.compositionFile,
			compositionId: target.compositionId,
			element: parsed.data.element,
			position: null,
		};

		const delivered = liveEventsServer.sendEventToClientId(target.clientId, {
			type: 'element-install-request',
			request: installRequest,
		});

		if (delivered === false) {
			response.writeHead(409);
			response.end(
				JSON.stringify({
					success: false,
					reason: 'The selected Remotion Studio tab is no longer connected',
				}),
			);
			return;
		}

		focusBrowserTab({url: target.studioUrl}).catch(() => undefined);

		response.writeHead(200);
		response.end(JSON.stringify({success: true, status: 'sent'}));
	} catch (err) {
		response.writeHead(500);
		response.end(
			JSON.stringify({success: false, reason: (err as Error).message}),
		);
	}
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

	const displayName = await getEditorName();

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
		url.pathname === '/api/element-install-target' ||
		url.pathname === '/api/request-element-install'
	) {
		if (request.method === 'OPTIONS') {
			return handleElementInstallOptions({request, response});
		}

		if (url.pathname === '/api/element-install-target') {
			return handleElementInstallTarget({
				liveEventsServer,
				request,
				response,
				remotionRoot,
				gitSource,
			});
		}

		return handleRequestElementInstall({
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
	});
};
