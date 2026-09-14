import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {serveStatic} from '../preview-server/serve-static';

test('allows Remotion Convert to read public assets only', async () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'remotion-convert-cors-'));
	const asset = path.join(directory, 'video.mp4');
	writeFileSync(asset, 'video');

	const server = createServer((request, response) => {
		serveStatic({
			root: directory,
			path: asset,
			req: request,
			res: response,
			allowOutsidePublicFolder: false,
			allowRemotionConvertCors: request.url === '/asset',
		}).catch((error) => response.destroy(error));
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

	try {
		const address = server.address();
		if (address === null || typeof address === 'string') {
			throw new Error('Expected an HTTP server address');
		}

		const origin = `http://127.0.0.1:${address.port}`;
		const preflight = await fetch(`${origin}/asset`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'https://www.remotion.dev',
				'Access-Control-Request-Headers': 'range',
				'Access-Control-Request-Method': 'GET',
				'Access-Control-Request-Private-Network': 'true',
			},
		});
		expect(preflight.status).toBe(204);
		expect(preflight.headers.get('access-control-allow-origin')).toBe(
			'https://www.remotion.dev',
		);
		expect(preflight.headers.get('access-control-allow-private-network')).toBe(
			'true',
		);

		const assetResponse = await fetch(`${origin}/asset`, {
			headers: {
				Origin: 'https://www.remotion.dev',
				Range: 'bytes=0-1',
			},
		});
		expect(assetResponse.status).toBe(206);
		expect(await assetResponse.text()).toBe('vi');
		expect(assetResponse.headers.get('access-control-allow-origin')).toBe(
			'https://www.remotion.dev',
		);

		const outputResponse = await fetch(`${origin}/output`, {
			headers: {Origin: 'https://www.remotion.dev'},
		});
		expect(outputResponse.status).toBe(200);
		expect(
			outputResponse.headers.get('access-control-allow-origin'),
		).toBeNull();

		const unrelatedOriginResponse = await fetch(`${origin}/asset`, {
			headers: {Origin: 'https://example.com'},
		});
		expect(unrelatedOriginResponse.status).toBe(200);
		expect(
			unrelatedOriginResponse.headers.get('access-control-allow-origin'),
		).toBeNull();
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
		rmSync(directory, {recursive: true});
	}
});
