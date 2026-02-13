import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import type {
	ApiRoutes,
	CompletedClientRender,
	GitSource,
	RenderDefaults,
	RenderJob,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {SOURCE_MAP_ENDPOINT, getProjectName} from '@remotion/studio-shared';
import fs, {createWriteStream} from 'fs';
import {createReadStream, existsSync, statSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path, {join} from 'node:path';
import {URLSearchParams} from 'node:url';
import {
	addCompletedClientRender,
	getCompletedClientRenders,
	removeCompletedClientRender,
} from './client-render-queue';
import {getFileSource} from './helpers/get-file-source';
import {getInstalledInstallablePackages} from './helpers/get-installed-installable-packages';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './helpers/open-in-editor';
import {resolveOutputPath} from './helpers/resolve-output-path';
import {allApiRoutes} from './preview-server/api-routes';
import type {ApiHandler, QueueMethods} from './preview-server/api-types';
import {getPackageManager} from './preview-server/get-package-manager';
import {handleRequest} from './preview-server/handler';
import type {LiveEventsServer} from './preview-server/live-events';
import {parseRequestBody} from './preview-server/parse-body';
import {fetchFolder, getFiles} from './preview-server/public-folder';
import {serveStatic} from './preview-server/serve-static';
import type {RemotionConfigResponse} from './remotion-config-response';

const editorGuess = guessEditor();

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
	getCurrentInputProps,
	getEnvVariables,
	publicDir,
	getRenderQueue,
	getRenderDefaults,
	numberOfAudioTags,
	audioLatencyHint,
	gitSource,
	logLevel,
	enableCrossSiteIsolation,
}: {
	remotionRoot: string;
	hash: string;
	response: ServerResponse;
	publicDir: string;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	getRenderQueue: () => RenderJob[];
	getRenderDefaults: () => RenderDefaults;
	numberOfAudioTags: number;
	audioLatencyHint: AudioContextLatencyCategory | null;
	gitSource: GitSource | null;
	logLevel: LogLevel;
	enableCrossSiteIsolation: boolean;
}) => {
	const [edit] = await editorGuess;
	const displayName = getDisplayNameForEditor(edit ? edit.command : null);

	response.setHeader('content-type', 'text/html');
	if (enableCrossSiteIsolation) {
		response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
		response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
	}

	const packageManager = getPackageManager(remotionRoot, undefined, 0);
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
			numberOfAudioTags,
			publicFiles: getFiles(),
			includeFavicon: true,
			title: 'Remotion Studio',
			renderDefaults: getRenderDefaults(),
			publicFolderExists: existsSync(publicDir) ? publicDir : null,
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
			audioLatencyHint: audioLatencyHint ?? 'interactive',
		}),
	);
};

const handleFileSource = async ({
	method,
	remotionRoot,
	search,
	response,
}: {
	method: string;
	remotionRoot: string;
	search: string;
	response: ServerResponse;
}): Promise<void> => {
	if (method === 'OPTIONS') {
		response.writeHead(200);
		response.end();
		return Promise.resolve();
	}

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

const handleOpenInEditor = async (
	remotionRoot: string,
	req: IncomingMessage,
	res: ServerResponse,
	logLevel: LogLevel,
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
		return;
	}

	try {
		const body = (await parseRequestBody(req)) as {
			stack: SymbolicatedStackFrame;
		};
		if (!('stack' in body)) {
			throw new TypeError('Need to pass stack');
		}

		const stack = body.stack as SymbolicatedStackFrame;

		const guess = await editorGuess;
		const didOpen = await launchEditor({
			colNumber: stack.originalColumnNumber as number,
			editor: guess[0],
			fileName: path.resolve(remotionRoot, stack.originalFileName as string),
			lineNumber: stack.originalLineNumber as number,
			vsCodeNewWindow: false,
			logLevel,
		});
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);
		res.end(
			JSON.stringify({
				success: didOpen,
			}),
		);
	} catch {
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: false,
			}),
		);
	}
};

const validateSameOrigin = (req: IncomingMessage): void => {
	const {origin, host} = req.headers;
	if (origin) {
		const originUrl = new URL(origin);
		if (originUrl.host !== host) {
			throw new Error('Request from different origin not allowed');
		}
	}
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

const handleRegisterClientRender = async ({
	req,
	res,
	remotionRoot,
}: {
	req: IncomingMessage;
	res: ServerResponse;
	remotionRoot: string;
}): Promise<void> => {
	try {
		validateSameOrigin(req);
		const body = (await parseRequestBody(req)) as CompletedClientRender;
		addCompletedClientRender({render: body, remotionRoot});

		res.setHeader('content-type', 'application/json');
		res.writeHead(200);
		res.end(JSON.stringify({success: true}));
	} catch (err) {
		res.statusCode = 500;
		res.end(JSON.stringify({error: (err as Error).message}));
	}
};

const handleUnregisterClientRender = async ({
	req,
	res,
}: {
	req: IncomingMessage;
	res: ServerResponse;
}): Promise<void> => {
	try {
		validateSameOrigin(req);
		const body = (await parseRequestBody(req)) as {id: string};
		removeCompletedClientRender(body.id);

		res.setHeader('content-type', 'application/json');
		res.writeHead(200);
		res.end(JSON.stringify({success: true}));
	} catch (err) {
		res.statusCode = 500;
		res.end(JSON.stringify({error: (err as Error).message}));
	}
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

const handleWasm = (
	_: IncomingMessage,
	response: ServerResponse,
): Promise<void> => {
	const filePath = path.resolve(
		require.resolve('source-map'),
		'..',
		'lib',
		'mappings.wasm',
	);

	const stat = statSync(filePath);

	response.writeHead(200, {
		'Content-Type': 'application/wasm',
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
	numberOfAudioTags,
	queueMethods: methods,
	gitSource,
	binariesDirectory,
	audioLatencyHint,
	enableCrossSiteIsolation,
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
	numberOfAudioTags: number;
	queueMethods: QueueMethods;
	gitSource: GitSource | null;
	binariesDirectory: string | null;
	audioLatencyHint: AudioContextLatencyCategory | null;
	enableCrossSiteIsolation: boolean;
}): Promise<void> => {
	const url = new URL(request.url as string, 'http://localhost');

	if (url.pathname === '/api/file-source') {
		return handleFileSource({
			remotionRoot,
			search: url.search,
			method: request.method as string,
			response,
		});
	}

	if (url.pathname === '/api/open-in-editor') {
		return handleOpenInEditor(remotionRoot, request, response, logLevel);
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

	if (url.pathname === '/api/register-client-render') {
		return handleRegisterClientRender({
			req: request,
			res: response,
			remotionRoot,
		});
	}

	if (url.pathname === '/api/unregister-client-render') {
		return handleUnregisterClientRender({
			req: request,
			res: response,
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
			});
		}
	}

	if (url.pathname === '/favicon.ico') {
		return handleFavicon(request, response);
	}

	if (url.pathname === '/beep.wav') {
		return handleBeep(request, response);
	}

	if (url.pathname === SOURCE_MAP_ENDPOINT) {
		return handleWasm(request, response);
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
		getCurrentInputProps,
		getEnvVariables,
		publicDir,
		getRenderQueue,
		getRenderDefaults,
		numberOfAudioTags,
		gitSource,
		logLevel,
		audioLatencyHint,
		enableCrossSiteIsolation,
	});
};
