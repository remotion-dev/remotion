import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {exampleVideos} from '@remotion/example-videos';
import type {ParseMediaOnWorker} from '../options';
import {parseMedia as nodeParseMedia} from '../parse-media';
import type {MediaParserReaderInterface} from '../readers/reader';
import {universalReader} from '../universal';

// Serves files like a static file server behind `staticFile()`
const serveFiles = (files: Record<string, string>) => {
	return Bun.serve({
		port: 0,
		fetch(req) {
			const filePath = files[new URL(req.url).pathname];
			if (!filePath) {
				return new Response('Not found', {status: 404});
			}

			const file = Bun.file(filePath);
			const match = req.headers.get('range')?.match(/^bytes=(\d+)-(\d*)$/);
			if (!match) {
				return new Response(file);
			}

			const start = Number(match[1]);
			const end = match[2] ? Number(match[2]) : file.size - 1;
			return new Response(file.slice(start, end + 1), {
				status: 206,
				headers: {
					'content-range': `bytes ${start}-${end}/${file.size}`,
					'content-length': String(end - start + 1),
				},
			});
		},
	});
};

// Bundles like a browser bundler would, which replaces `fs` with an empty module
const withBrowserBundle = async (
	entrypoints: string[],
	pageUrl: string,
	fn: (outdir: string) => Promise<void>,
) => {
	const outdir = mkdtempSync(path.join(tmpdir(), 'media-parser-browser-'));
	const globals = globalThis as {window?: unknown};
	try {
		const result = await Bun.build({
			entrypoints: entrypoints.map((e) => path.join(__dirname, '..', e)),
			outdir,
			target: 'browser',
			naming: '[name].mjs',
		});
		if (!result.success) {
			throw new AggregateError(result.logs, 'Bundling failed');
		}

		globals.window = {location: {href: pageUrl}};
		await fn(outdir);
	} finally {
		delete globals.window;
		rmSync(outdir, {recursive: true, force: true});
	}
};

test('universalReader should fetch relative src in the browser', async () => {
	const server = serveFiles({'/public/sample-tone.wav': exampleVideos.chirp});
	try {
		await withBrowserBundle(
			['index.ts', 'universal.ts'],
			new URL('/public/index.html', server.url).toString(),
			async (outdir) => {
				const {parseMedia}: {parseMedia: typeof nodeParseMedia} = await import(
					path.join(outdir, 'index.mjs')
				);
				const {
					universalReader: browserUniversalReader,
				}: {universalReader: MediaParserReaderInterface} = await import(
					path.join(outdir, 'universal.mjs')
				);

				// Root-relative, as returned by `staticFile()`
				const rootRelative = await parseMedia({
					src: '/public/sample-tone.wav',
					reader: browserUniversalReader,
					fields: {container: true, durationInSeconds: true, name: true},
					acknowledgeRemotionLicense: true,
				});
				expect(rootRelative).toEqual({
					container: 'wav',
					durationInSeconds: 30,
					name: 'sample-tone.wav',
				});

				// Relative to the page URL
				const {container} = await parseMedia({
					src: 'sample-tone.wav',
					reader: browserUniversalReader,
					fields: {container: true},
					acknowledgeRemotionLicense: true,
				});
				expect(container).toBe('wav');
			},
		);
	} finally {
		server.stop(true);
	}
});

test('parseMediaOnWebWorker should resolve relative src against the page', async () => {
	const server = serveFiles({
		'/public/sample-clip.webm': exampleVideos.framerWebm,
	});
	try {
		await withBrowserBundle(
			['worker.module.ts', 'worker-web-entry.ts'],
			new URL('/some/page', server.url).toString(),
			async (outdir) => {
				const {
					parseMediaOnWebWorker,
				}: {parseMediaOnWebWorker: ParseMediaOnWorker} = await import(
					path.join(outdir, 'worker.module.mjs')
				);

				const {container, dimensions} = await parseMediaOnWebWorker({
					src: '/public/sample-clip.webm',
					fields: {container: true, dimensions: true},
					acknowledgeRemotionLicense: true,
				});
				expect(container).toBe('webm');
				expect(dimensions).toEqual({width: 1080, height: 1080});
			},
		);
	} finally {
		server.stop(true);
	}
});

test('universalReader should keep reading local paths in Node, even if window exists', async () => {
	const globals = globalThis as {window?: unknown};
	globals.window = {location: {href: 'http://localhost:3000/'}};
	try {
		const {container, name} = await nodeParseMedia({
			src: exampleVideos.chirp,
			reader: universalReader,
			fields: {container: true, name: true},
			acknowledgeRemotionLicense: true,
		});
		expect(container).toBe('wav');
		expect(name).toBe('chirp.wav');
	} finally {
		delete globals.window;
	}
});
