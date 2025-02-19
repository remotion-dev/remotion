import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import type {
	ApiRoutes,
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
import {getFileSource} from './helpers/get-file-source';
import {getInstalledInstallablePackages} from './helpers/get-installed-installable-packages';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './helpers/open-in-editor';
import {allApiRoutes} from './preview-server/api-routes';
import type {ApiHandler, QueueMethods} from './preview-server/api-types';
import {getPackageManager} from './preview-server/get-package-manager';
import {handleRequest} from './preview-server/handler';
import type {LiveEventsServer} from './preview-server/live-events';
import {parseRequestBody} from './preview-server/parse-body';
import {fetchFolder, getFiles} from './preview-server/public-folder';
import {serveStatic} from './preview-server/serve-static';

const editorGuess = guessEditor();

const static404 = (response: ServerResponse) => {
	response.writeHead(404);
	response.end(
		'The static/ prefix has been changed, this URL is no longer valid.',
	);
};

const output404 = (response: ServerResponse) => {
	response.writeHead(404);
	response.end(
		'The outputs/ prefix has been changed, this URL is no longer valid.',
	);
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
	gitSource,
	logLevel,
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
	gitSource: GitSource | null;
	logLevel: LogLevel;
}) => {
	const [edit] = await editorGuess;
	const displayName = getDisplayNameForEditor(edit ? edit.command : null);

	response.setHeader('content-type', 'text/html');
	response.writeHead(200);
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
}) => {
	if (method === 'OPTIONS') {
		response.writeHead(200);
		response.end();
		return;
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
	return response.end();
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
}): void => {
	try {
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
};

const handleFavicon = (_: IncomingMessage, response: ServerResponse) => {
	const filePath = path.join(__dirname, '..', 'web', 'favicon.png');
	const stat = statSync(filePath);

	response.writeHead(200, {
		'Content-Type': 'image/png',
		'Content-Length': stat.size,
	});

	const readStream = createReadStream(filePath);
	readStream.pipe(response);
};

const handleBeep = (_: IncomingMessage, response: ServerResponse) => {
	const filePath = path.join(__dirname, '..', 'web', 'beep.wav');
	const stat = statSync(filePath);

	response.writeHead(200, {
		'Content-Type': 'audio/wav',
		'Content-Length': stat.size,
	});

	const readStream = createReadStream(filePath);
	readStream.pipe(response);
};

const handleWasm = (_: IncomingMessage, response: ServerResponse) => {
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
}) => {
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

	if (url.pathname === '/api/add-asset') {
		return handleAddAsset({
			req: request,
			res: response,
			search: url.search,
			publicDir,
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
	});
};
