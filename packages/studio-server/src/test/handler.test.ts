import {expect, test} from 'bun:test';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {Readable} from 'node:stream';
import {handleRequest} from '../preview-server/handler';

const makeRequest = ({
	body,
	host,
	origin,
}: {
	body: unknown;
	host: string;
	origin: string;
}) => {
	const request = Readable.from([JSON.stringify(body)]) as IncomingMessage;
	request.method = 'POST';
	request.headers = {
		host,
		origin,
	};

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

test('allows same-origin API requests', async () => {
	const response = makeResponse();

	await handleRequest({
		binariesDirectory: null,
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
