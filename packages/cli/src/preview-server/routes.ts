import {BundlerInternals} from '@remotion/bundler';
import {createReadStream, statSync} from 'fs';
import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {URLSearchParams} from 'url';
import {getFileSource} from './error-overlay/react-overlay/utils/get-file-source';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './error-overlay/react-overlay/utils/open-in-editor';
import type {SymbolicatedStackFrame} from './error-overlay/react-overlay/utils/stack-frame';
import type {LiveEventsServer} from './live-events';
import {getProjectInfo} from './project-info';
import {serveStatic} from './serve-static';
import {isUpdateAvailableWithTimeout} from './update-available';

const handleUpdate = async (_: IncomingMessage, response: ServerResponse) => {
	const data = await isUpdateAvailableWithTimeout();
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

const handleFallback = async (
	hash: string,
	_: IncomingMessage,
	response: ServerResponse,
	getCurrentInputProps: () => object
) => {
	const edit = await editorGuess;
	const displayName = getDisplayNameForEditor(edit[0].command);

	response.setHeader('content-type', 'text/html');
	response.writeHead(200);
	response.end(
		BundlerInternals.indexHtml(hash, '/', displayName, getCurrentInputProps())
	);
};

const handleProjectInfo = async (
	_: IncomingMessage,
	response: ServerResponse
) => {
	const data = await getProjectInfo();
	response.setHeader('content-type', 'application/json');
	response.writeHead(200);
	response.end(JSON.stringify(data));
};

const handleFileSource = async (
	search: string,
	_: IncomingMessage,
	response: ServerResponse
) => {
	if (!search.startsWith('?')) {
		throw new Error('query must start with ?');
	}

	const query = new URLSearchParams(search);
	const f = query.get('f');
	if (typeof f !== 'string') {
		throw new Error('must pass `f` parameter');
	}

	const data = await getFileSource(decodeURIComponent(f));
	response.writeHead(200);
	response.write(data);
	return response.end();
};

const handleOpenInEditor = async (
	req: IncomingMessage,
	res: ServerResponse
) => {
	try {
		const b = await new Promise<string>((_resolve) => {
			let data = '';
			req.on('data', (chunk) => {
				data += chunk;
			});
			req.on('end', () => {
				_resolve(data.toString());
			});
		});
		const body = JSON.parse(b) as {stack: SymbolicatedStackFrame};
		if (!('stack' in body)) {
			throw new TypeError('Need to pass stack');
		}

		const stack = body.stack as SymbolicatedStackFrame;

		const guess = await editorGuess;
		const didOpen = await launchEditor({
			colNumber: stack.originalColumnNumber as number,
			editor: guess[0],
			fileName: path.resolve(process.cwd(), stack.originalFileName as string),
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
}: {
	hash: string;
	hashPrefix: string;
	request: IncomingMessage;
	response: ServerResponse;
	liveEventsServer: LiveEventsServer;
	getCurrentInputProps: () => object;
}) => {
	const url = new URL(request.url as string, 'http://localhost');

	if (url.pathname === '/api/update') {
		return handleUpdate(request, response);
	}

	if (url.pathname === '/api/project-info') {
		return handleProjectInfo(request, response);
	}

	if (url.pathname === '/api/file-source') {
		return handleFileSource(url.search, request, response);
	}

	if (url.pathname === '/api/open-in-editor') {
		return handleOpenInEditor(request, response);
	}

	if (url.pathname === '/remotion.png') {
		return handleFavicon(request, response);
	}

	if (url.pathname === '/events') {
		return liveEventsServer.router(request, response);
	}

	if (url.pathname.startsWith(hash)) {
		const root = path.join(process.cwd(), 'public');
		return serveStatic(root, hash, request, response);
	}

	if (url.pathname.startsWith(hashPrefix)) {
		return static404(response);
	}

	return handleFallback(hash, request, response, getCurrentInputProps);
};
