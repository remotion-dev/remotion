import {expect, test} from 'bun:test';
import {
	createWriteStream,
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {downloadFile} from '../download';
import {downloadWhisperModel} from '../download-whisper-model';

const makeFileStream = () => {
	const dir = mkdtempSync(path.join(os.tmpdir(), 'remotion-download-'));
	const filePath = path.join(dir, 'file.bin');
	const fileStream = createWriteStream(filePath);

	return {
		filePath,
		fileStream,
		cleanup: () => rmSync(dir, {recursive: true, force: true}),
	};
};

const mockFetch = ({
	body,
	contentLength,
}: {
	body: string;
	contentLength: string;
}) => {
	const originalFetch = globalThis.fetch;

	globalThis.fetch = (() =>
		Promise.resolve({
			headers: new Headers({'content-length': contentLength}),
			body: new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode(body));
					controller.close();
				},
			}),
		})) as unknown as typeof fetch;

	return () => {
		globalThis.fetch = originalFetch;
	};
};

test('rejects when the response ends before Content-Length is reached', async () => {
	const restore = mockFetch({body: 'short', contentLength: '100'});
	const {fileStream, cleanup} = makeFileStream();

	try {
		await expect(
			downloadFile({
				fileStream,
				url: 'https://example.com/file.bin',
				printOutput: false,
				onProgress: undefined,
				signal: null,
			}),
		).rejects.toThrow(/Download ended after 5 of 100 bytes/);

		expect(fileStream.closed).toBe(true);
	} finally {
		restore();
		fileStream.destroy();
		cleanup();
	}
}, 5000);

test('rejects when Content-Length is not a number', async () => {
	const restore = mockFetch({body: 'data', contentLength: 'not-a-number'});
	const {fileStream, cleanup} = makeFileStream();

	try {
		await expect(
			downloadFile({
				fileStream,
				url: 'https://example.com/file.bin',
				printOutput: false,
				onProgress: undefined,
				signal: null,
			}),
		).rejects.toThrow(/Invalid Content-Length header/);

		expect(fileStream.closed).toBe(true);
	} finally {
		restore();
		fileStream.destroy();
		cleanup();
	}
}, 5000);

test('resolves and writes the file when the response matches Content-Length', async () => {
	const server = http.createServer((_req, res) => {
		res.writeHead(200, {'content-length': '4'});
		res.end('data');
	});

	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', resolve);
	});

	const address = server.address();
	if (address === null || typeof address === 'string') {
		throw new Error('Could not determine the port of the test server');
	}

	const {fileStream, cleanup, filePath} = makeFileStream();
	const finished = new Promise<void>((resolve) => {
		fileStream.on('finish', () => resolve());
	});

	try {
		await downloadFile({
			fileStream,
			url: `http://127.0.0.1:${address.port}/file.bin`,
			printOutput: false,
			onProgress: undefined,
			signal: null,
		});
		await finished;

		expect(readFileSync(filePath, 'utf8')).toBe('data');
	} finally {
		server.closeAllConnections();
		await new Promise<void>((resolve) => {
			server.close(() => resolve());
		});
		cleanup();
	}
}, 5000);

test('removes a partial model so that the next run downloads it again', async () => {
	const restore = mockFetch({body: 'short', contentLength: '100'});
	const folder = mkdtempSync(path.join(os.tmpdir(), 'remotion-model-'));
	const filePath = path.join(folder, 'ggml-tiny.bin');

	try {
		await expect(
			downloadWhisperModel({
				model: 'tiny',
				folder,
				printOutput: false,
			}),
		).rejects.toThrow(/Download ended after 5 of 100 bytes/);

		expect(existsSync(filePath)).toBe(false);
	} finally {
		restore();
		rmSync(folder, {recursive: true, force: true});
	}
}, 5000);

test('rejects a model whose size does not match the expected size', async () => {
	const restore = mockFetch({body: 'data', contentLength: '4'});
	const folder = mkdtempSync(path.join(os.tmpdir(), 'remotion-model-'));
	const filePath = path.join(folder, 'ggml-tiny.bin');
	writeFileSync(filePath, 'partial');

	try {
		await expect(
			downloadWhisperModel({
				model: 'tiny',
				folder,
				printOutput: false,
			}),
		).rejects.toThrow(/but the size is 7 bytes/);

		expect(readFileSync(filePath, 'utf8')).toBe('partial');
	} finally {
		restore();
		rmSync(folder, {recursive: true, force: true});
	}
}, 5000);
