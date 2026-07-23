import {expect, test} from 'bun:test';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {Readable} from 'node:stream';
import {handleRequest} from '../preview-server/handler';

const makeRequest = ({
	body,
	host,
	origin,
	remoteAddress = '127.0.0.1',
	method = 'POST',
}: {
	body: unknown;
	host: string;
	origin: string | undefined;
	remoteAddress?: string;
	method?: string;
}) => {
	const request = Readable.from([JSON.stringify(body)]) as IncomingMessage;
	Object.defineProperty(request, 'socket', {
		value: {remoteAddress},
	});
	request.method = method;
	request.headers = {
		host,
	};
	if (origin) {
		request.headers.origin = origin;
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
			configFile: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
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

test('allows same-origin API requests from non-local peers', async () => {
	const response = makeResponse();

	await handleRequest({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		handler: ({input}) => {
			return Promise.resolve({input});
		},
		logLevel: 'info',
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: '',
		remotionRoot: '',
		request: makeRequest({
			body: {relativePath: 'logo.png'},
			host: '192.168.1.10:3000',
			origin: 'http://192.168.1.10:3000',
			remoteAddress: '192.168.1.5',
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

test('rejects API requests without an Origin header before calling the handler', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			configFile: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
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

test('allows GET API requests without an Origin header', async () => {
	const response = makeResponse();

	await handleRequest({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		handler: ({input}) => {
			return Promise.resolve({input});
		},
		logLevel: 'info',
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
			method: 'GET',
			origin: undefined,
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

test('allows HEAD API requests without an Origin header', async () => {
	const response = makeResponse();

	await handleRequest({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		handler: ({input}) => {
			return Promise.resolve({input});
		},
		logLevel: 'info',
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
			method: 'HEAD',
			origin: undefined,
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

test('rejects requests with a mismatched Origin scheme before calling the handler', async () => {
	const response = makeResponse();
	let didCallHandler = false;

	await expect(
		handleRequest({
			binariesDirectory: null,
			configFile: null,
			entryPoint: '',
			handler: () => {
				didCallHandler = true;
				return Promise.resolve({});
			},
			logLevel: 'info',
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
		configFile: null,
		entryPoint: '',
		handler: ({input}) => {
			return Promise.resolve({input});
		},
		logLevel: 'info',
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
