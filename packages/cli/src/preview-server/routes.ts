import {BundlerInternals} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import {createReadStream, statSync} from 'fs';
import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {URLSearchParams} from 'url';
import {ConfigInternals} from '../config';
import {getNumberOfSharedAudioTags} from '../config/number-of-shared-audio-tags';
import {parsedCli} from '../parse-command-line';
import {allApiRoutes} from './api-routes';
import type {ApiHandler, ApiRoutes} from './api-types';
import {getFileSource} from './error-overlay/react-overlay/utils/get-file-source';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './error-overlay/react-overlay/utils/open-in-editor';
import type {SymbolicatedStackFrame} from './error-overlay/react-overlay/utils/stack-frame';
import {getPackageManager} from './get-package-manager';
import {handleRequest} from './handler';
import type {LiveEventsServer} from './live-events';
import {parseRequestBody} from './parse-body';
import {getProjectInfo} from './project-info';
import {fetchFolder, getFiles} from './public-folder';
import {getRenderQueue} from './render-queue/queue';
import {serveStatic} from './serve-static';
import {isUpdateAvailableWithTimeout} from './update-available';

const handleUpdate = async (
	remotionRoot: string,
	_: IncomingMessage,
	response: ServerResponse
) => {
	const data = await isUpdateAvailableWithTimeout(remotionRoot);
	response.setHeader('content-type', 'application/json');
	response.writeHead(200);
	response.end(JSON.stringify(data));
};

const editorGuess = guessEditor();

const static404 = (response: ServerResponse) => {
	response.writeHead(404);
	response.end(
		'The static/ prefix has been changed, this URL is no longer valid.'
	);
};

const handleFallback = async ({
	remotionRoot,
	hash,
	response,
	getCurrentInputProps,
	getEnvVariables,
	publicDir,
}: {
	remotionRoot: string;
	hash: string;
	response: ServerResponse;
	publicDir: string;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
}) => {
	const [edit] = await editorGuess;
	const displayName = getDisplayNameForEditor(edit ? edit.command : null);

	const defaultQuality = ConfigInternals.getQuality();
	const defaultScale = ConfigInternals.getScale();
	const logLevel = ConfigInternals.Logging.getLogLevel();
	const defaultCodec = ConfigInternals.getOutputCodecOrUndefined();
	const concurrency = RenderInternals.getActualConcurrency(
		ConfigInternals.getConcurrency()
	);
	const imageFormat = ConfigInternals.getUserPreferredImageFormat();
	const muted = ConfigInternals.getMuted();
	const enforceAudioTrack = ConfigInternals.getEnforceAudioTrack();
	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = ConfigInternals.getProResProfile() ?? 'hq';
	const audioBitrate = ConfigInternals.getAudioBitrate();
	const videoBitrate = ConfigInternals.getVideoBitrate();
	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const numberOfGifLoops = ConfigInternals.getNumberOfGifLoops();

	// TODO: Separate image and video formats in the future. Default should be PNG for images and JPEG for videos.
	const stillImageFormat: 'png' | 'jpeg' =
		imageFormat === 'jpeg' || imageFormat === 'png' ? imageFormat : 'png';
	const videoImageFormat =
		imageFormat === 'jpeg' || imageFormat === 'png' ? imageFormat : 'jpeg';

	const maxConcurrency = RenderInternals.getMaxConcurrency();
	const minConcurrency = RenderInternals.getMinConcurrency();

	response.setHeader('content-type', 'text/html');
	response.writeHead(200);
	const packageManager = getPackageManager(remotionRoot, undefined);
	fetchFolder({publicDir, staticHash: hash});

	response.end(
		BundlerInternals.indexHtml({
			staticHash: hash,
			baseDir: '/',
			editorName: displayName,
			envVariables: getEnvVariables(),
			inputProps: getCurrentInputProps(),
			remotionRoot,
			previewServerCommand:
				packageManager === 'unknown' ? null : packageManager.startCommand,
			renderQueue: getRenderQueue(),
			numberOfAudioTags:
				parsedCli['number-of-shared-audio-tags'] ??
				getNumberOfSharedAudioTags(),
			publicFiles: getFiles(),
			includeFavicon: true,
			title: 'Remotion Preview',
			renderDefaults: {
				quality: defaultQuality ?? 80,
				scale: defaultScale ?? 1,
				logLevel,
				codec: defaultCodec ?? 'h264',
				concurrency,
				maxConcurrency,
				minConcurrency,
				stillImageFormat,
				videoImageFormat,
				muted,
				enforceAudioTrack,
				proResProfile,
				pixelFormat,
				audioBitrate,
				videoBitrate,
				everyNthFrame,
				numberOfGifLoops,
			},
		})
	);
};

const handleProjectInfo = async (
	remotionRoot: string,
	_: IncomingMessage,
	response: ServerResponse
) => {
	const data = await getProjectInfo(remotionRoot);
	response.setHeader('content-type', 'application/json');
	response.writeHead(200);
	response.end(JSON.stringify(data));
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
	res: ServerResponse
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
		});
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);
		res.end(
			JSON.stringify({
				success: didOpen,
			})
		);
	} catch (err) {
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: false,
			})
		);
	}
};

const handleFavicon = (_: IncomingMessage, response: ServerResponse) => {
	const filePath = path.join(__dirname, '..', '..', 'web', 'favicon.png');
	const stat = statSync(filePath);

	response.writeHead(200, {
		'Content-Type': 'image/png',
		'Content-Length': stat.size,
	});

	const readStream = createReadStream(filePath);
	readStream.pipe(response);
};

export const handleRoutes = ({
	hash,
	hashPrefix,
	request,
	response,
	liveEventsServer,
	getCurrentInputProps,
	getEnvVariables,
	remotionRoot,
	entryPoint,
	publicDir,
}: {
	hash: string;
	hashPrefix: string;
	request: IncomingMessage;
	response: ServerResponse;
	liveEventsServer: LiveEventsServer;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	remotionRoot: string;
	entryPoint: string;
	publicDir: string;
}) => {
	const url = new URL(request.url as string, 'http://localhost');

	if (url.pathname === '/api/update') {
		return handleUpdate(remotionRoot, request, response);
	}

	if (url.pathname === '/api/project-info') {
		return handleProjectInfo(remotionRoot, request, response);
	}

	if (url.pathname === '/api/file-source') {
		return handleFileSource({
			remotionRoot,
			search: url.search,
			method: request.method as string,
			response,
		});
	}

	if (url.pathname === '/api/open-in-editor') {
		return handleOpenInEditor(remotionRoot, request, response);
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
			});
		}
	}

	if (url.pathname === '/remotion.png') {
		return handleFavicon(request, response);
	}

	if (url.pathname === '/events') {
		return liveEventsServer.router(request, response);
	}

	if (url.pathname.startsWith(hash)) {
		return serveStatic(publicDir, hash, request, response);
	}

	if (url.pathname.startsWith(hashPrefix)) {
		return static404(response);
	}

	return handleFallback({
		remotionRoot,
		hash,
		response,
		getCurrentInputProps,
		getEnvVariables,
		publicDir,
	});
};
