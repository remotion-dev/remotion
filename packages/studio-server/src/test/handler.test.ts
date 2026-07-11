import {expect, test} from 'bun:test';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {Readable} from 'node:stream';
import {handleRequest} from '../preview-server/handler';
import {REMOTION_STUDIO_AUTH_HEADER} from '../preview-server/validate-same-origin';

const studioAuthToken = 'test-token';

const makeRequest = ({
	body,
	host,
	origin,
	remoteAddress = '127.0.0.1',
	token = studioAuthToken,
}: {
	body: unknown;
	host: string;
	origin: string | undefined;
	remoteAddress?: string;
	token?: string | null;
}) => {
	const request = Readable.from([JSON.stringify(body)]) as IncomingMessage;
	Object.defineProperty(request, 'socket', {
		value: {remoteAddress},
	});
	request.method = 'POST';
	request.headers = {
		host,
	};
	if (origin) {
		request.headers.origin = origin;
	}

	if (token !== null) {
		request.headers[REMOTION_STUDIO_AUTH_HEADER] = token;
	}

	return request;
};

const makeResponse = () => {
	const response = {
		body: '',
		headers: {} as Record<string, string>,
		statusCode: 0,
		end(chunk?: string) {
			if (chunk) {
				this.body += chunk;
			}
		},
		setHeader(key: string, value: string) {
			this.headers[key] = value;
		},
		writeHead(statusCode: number) {
			this.statusCode = statusCode;
		},
	};

	return response as ServerResponse & typeof response;
};

test('rejects cross-origin API requests before calling the handler', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
			studioAuthToken,
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: '',
			request: makeRequest({
				body: {relativePath: 'logo.png'},
				host: 'localhost:3000',
				origin: 'https://attacker.example',
			}),
			response,
		}),
	).rejects.toThrow('Request from different origin not allowed');

	expect(didCallHandler).toBe(false);
	expect(response.statusCode).toBe(0);
});

test('rejects API requests from non-local peers even with matching Host and Origin', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
			studioAuthToken,
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: '',
			request: makeRequest({
				body: {relativePath: 'logo.png'},
				host: 'localhost:3000',
				origin: 'http://localhost:3000',
				remoteAddress: '192.168.1.5',
			}),
			response,
		}),
	).rejects.toThrow('Request from non-local address not allowed');

	expect(didCallHandler).toBe(false);
	expect(response.statusCode).toBe(0);
});

test('rejects API requests without a Studio authentication token before calling the handler', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
			studioAuthToken,
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: '',
			request: makeRequest({
				body: {relativePath: 'logo.png'},
				host: 'localhost:3000',
				origin: 'http://localhost:3000',
				token: null,
			}),
			response,
		}),
	).rejects.toThrow('Invalid Studio authentication token');

	expect(didCallHandler).toBe(false);
	expect(response.statusCode).toBe(0);
});

test('rejects API requests without an Origin header before calling the handler', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
			studioAuthToken,
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: '',
			request: makeRequest({
				body: {relativePath: 'logo.png'},
				host: 'localhost:3000',
				origin: undefined,
			}),
			response,
		}),
	).rejects.toThrow('Request without Origin header not allowed');

	expect(didCallHandler).toBe(false);
	expect(response.statusCode).toBe(0);
});

test('rejects requests with a mismatched Origin scheme before calling the handler', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
			studioAuthToken,
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: '',
			request: makeRequest({
				body: {relativePath: 'logo.png'},
				host: 'localhost:3000',
				origin: 'https://localhost:3000',
			}),
			response,
		}),
	).rejects.toThrow('Request from different origin not allowed');

	expect(didCallHandler).toBe(false);
	expect(response.statusCode).toBe(0);
});

test('allows same-origin API requests', async () => {
	const response = makeResponse();

	await handleRequest({
		binariesDirectory: null,
		entryPoint: '',
		handler: ({input}) => {
			return Promise.resolve({input});
		},
		logLevel: 'info',
		studioAuthToken,
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: '',
		remotionRoot: '',
		request: makeRequest({
			body: {relativePath: 'logo.png'},
			host: 'localhost:3000',
			origin: 'http://localhost:3000',
		}),
		response,
	});

	expect(response.statusCode).toBe(200);
	expect(JSON.parse(response.body)).toEqual({
		data: {
			input: {
				relativePath: 'logo.png',
			},
		},
		success: true,
	});
});
