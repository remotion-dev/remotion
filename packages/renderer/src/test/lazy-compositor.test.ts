import {expect, test} from 'bun:test';
import path from 'node:path';
import {exampleVideos} from '@remotion/example-videos';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {serveStatic} from '../serve-static';

test('starts the compositor when the first frame is requested', async () => {
	const downloadMap = makeDownloadMap(48000);
	const server = await serveStatic(path.dirname(exampleVideos.framerWebm), {
		port: null,
		downloadMap,
		remotionRoot: process.cwd(),
		offthreadVideoThreads: 1,
		logLevel: 'info',
		indent: false,
		offthreadVideoCacheSizeInBytes: null,
		binariesDirectory: null,
		forceIPv4: false,
	});

	try {
		expect(server.compositor.pid).toBeNull();

		const params = new URLSearchParams({
			src: `http://localhost:${server.port}/${path.basename(exampleVideos.framerWebm)}`,
			time: '0',
			transparent: 'false',
			toneMapped: 'false',
		});
		const response = await fetch(
			`http://localhost:${server.port}/proxy?${params}`,
		);
		const frame = await response.arrayBuffer();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toMatch(/^image\/(bmp|png)$/);
		expect(frame.byteLength).toBeGreaterThan(0);
		expect(server.compositor.pid).toBeNumber();
	} finally {
		await server.close();
		cleanDownloadMap(downloadMap);
	}
}, 90000);
