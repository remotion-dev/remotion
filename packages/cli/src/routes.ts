import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {createReadStream, existsSync, statSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path, {join} from 'node:path';
import {URLSearchParams} from 'node:url';
import {allApiRoutes} from '../../studio/src/preview-server/api-routes';
import type {
	ApiHandler,
	ApiRoutes,
} from '../../studio/src/preview-server/api-types';
import {getPackageManager} from '../../studio/src/preview-server/get-package-manager';
import {handleRequest} from '../../studio/src/preview-server/handler';
import type {RenderJob} from '../../studio/src/preview-server/job';
import type {LiveEventsServer} from '../../studio/src/preview-server/live-events';
import {parseRequestBody} from '../../studio/src/preview-server/parse-body';
import {getProjectInfo} from '../../studio/src/preview-server/project-info';
import {
	fetchFolder,
	getFiles,
} from '../../studio/src/preview-server/public-folder';
import {serveStatic} from '../../studio/src/preview-server/serve-static';
import {parsedCli} from '../parse-command-line';
import {ConfigInternals} from './config';
import {getFileSource} from './error-overlay/react-overlay/utils/get-file-source';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './error-overlay/react-overlay/utils/open-in-editor';
import type {SymbolicatedStackFrame} from './error-overlay/react-overlay/utils/stack-frame';

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
}: {
	remotionRoot: string;
	hash: string;
	response: ServerResponse;
	publicDir: string;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	getRenderQueue: () => RenderJob[];
}) => {
	const [edit] = await editorGuess;
	const displayName = getDisplayNameForEditor(edit ? edit.command : null);

	const defaultJpegQuality = ConfigInternals.getJpegQuality();
	const defaultScale = ConfigInternals.getScale();
	const logLevel = ConfigInternals.Logging.getLogLevel();
	const defaultCodec = ConfigInternals.getOutputCodecOrUndefined();
	const concurrency = RenderInternals.getActualConcurrency(
		ConfigInternals.getConcurrency(),
	);
	const muted = ConfigInternals.getMuted();
	const enforceAudioTrack = ConfigInternals.getEnforceAudioTrack();
	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = ConfigInternals.getProResProfile() ?? 'hq';
	const x264Preset = ConfigInternals.getPresetProfile() ?? 'medium';
	const audioBitrate = ConfigInternals.getAudioBitrate();
	const videoBitrate = ConfigInternals.getVideoBitrate();
	const encodingBufferSize = ConfigInternals.getEncodingBufferSize();
	const encodingMaxRate = ConfigInternals.getEncodingMaxRate();
	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const numberOfGifLoops = ConfigInternals.getNumberOfGifLoops();
	const delayRenderTimeout = ConfigInternals.getCurrentPuppeteerTimeout();
	const audioCodec = ConfigInternals.getAudioCodec();
	const stillImageFormat = ConfigInternals.getUserPreferredStillImageFormat();
	const videoImageFormat = ConfigInternals.getUserPreferredVideoImageFormat();
	const disableWebSecurity = ConfigInternals.getChromiumDisableWebSecurity();
	const headless = ConfigInternals.getChromiumHeadlessMode();
	const ignoreCertificateErrors = ConfigInternals.getIgnoreCertificateErrors();
	const openGlRenderer = ConfigInternals.getChromiumOpenGlRenderer();
	const offthreadVideoCacheSizeInBytes =
		ConfigInternals.getOffthreadVideoCacheSizeInBytes();
	const colorSpace = ConfigInternals.getColorSpace();
	const userAgent = ConfigInternals.getChromiumUserAgent();

	const maxConcurrency = RenderInternals.getMaxConcurrency();
	const minConcurrency = RenderInternals.getMinConcurrency();
	const multiProcessOnLinux = ConfigInternals.getChromiumMultiProcessOnLinux();

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
			studioServerCommand:
				packageManager === 'unknown' ? null : packageManager.startCommand,
			renderQueue: getRenderQueue(),
			numberOfAudioTags:
				parsedCli['number-of-shared-audio-tags'] ??
				getNumberOfSharedAudioTags(),
			publicFiles: getFiles(),
			includeFavicon: true,
			title: 'Remotion Studio',
			renderDefaults: {
				jpegQuality: defaultJpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
				scale: defaultScale ?? 1,
				logLevel,
				codec: defaultCodec ?? 'h264',
				concurrency,
				maxConcurrency,
				minConcurrency,
				stillImageFormat:
					stillImageFormat ?? RenderInternals.DEFAULT_STILL_IMAGE_FORMAT,
				videoImageFormat:
					videoImageFormat ?? RenderInternals.DEFAULT_VIDEO_IMAGE_FORMAT,
				muted,
				enforceAudioTrack,
				proResProfile,
				x264Preset,
				pixelFormat,
				audioBitrate,
				videoBitrate,
				encodingBufferSize,
				encodingMaxRate,
				everyNthFrame,
				numberOfGifLoops,
				delayRenderTimeout,
				audioCodec,
				disableWebSecurity,
				headless,
				ignoreCertificateErrors,
				openGlRenderer,
				offthreadVideoCacheSizeInBytes,
				colorSpace,
				multiProcessOnLinux,
				userAgent,
			},
			publicFolderExists: existsSync(publicDir) ? publicDir : null,
		}),
	);
};

const handleProjectInfo = async (
	remotionRoot: string,
	_: IncomingMessage,
	response: ServerResponse,
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
	res: ServerResponse,
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
			}),
		);
	} catch (err) {
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: false,
			}),
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
}) => {
	const url = new URL(request.url as string, 'http://localhost');

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
				logLevel,
			});
		}
	}

	if (url.pathname === '/remotion.png') {
		return handleFavicon(request, response);
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
	});
};
