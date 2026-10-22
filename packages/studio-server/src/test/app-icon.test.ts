import {expect, test} from 'bun:test';
import {createServer} from 'node:http';
import {handleAppIcon} from '../preview-server/routes/app-icon';

test('serves app artwork as PNGs', async () => {
	const server = createServer((request, response) => {
		handleAppIcon({
			pathname: new URL(request.url ?? '/', 'http://localhost').pathname,
			request,
			response,
		}).catch((error) => {
			response.writeHead(500);
			response.end((error as Error).message);
		});
	});

	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', resolve);
	});

	try {
		const address = server.address();
		if (address === null || typeof address === 'string') {
			throw new Error('Expected an HTTP server address.');
		}

		for (const [url, expectedWidth] of [
			['/api/app-icon/coding-agent/codex.png', 64],
			['/api/app-icon/file-manager/finder.png', 36],
			['/api/app-icon/git-client/github-desktop.png', 128],
			['/api/app-icon/terminal/ghostty.png', 72],
			['/api/app-icon/terminal/terminal.png', 72],
		] as const) {
			const response = await fetch(`http://127.0.0.1:${address.port}${url}`);
			const image = new Uint8Array(await response.arrayBuffer());

			expect(response.status).toBe(200);
			expect(response.headers.get('content-type')).toBe('image/png');
			expect([...image.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
			expect(new DataView(image.buffer).getUint32(16)).toBe(expectedWidth);
		}
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}
});
