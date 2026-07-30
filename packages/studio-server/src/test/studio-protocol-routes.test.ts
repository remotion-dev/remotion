import {expect, test} from 'bun:test';
import {createServer} from 'node:http';
import {connect} from 'node:net';
import {createElementPayload} from '@remotion/studio-protocol';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {
	clearElementInstallStateForTests,
	updateElementInstallTarget,
} from '../preview-server/element-install-state';
import type {LiveEventsServer} from '../preview-server/live-events';
import {handleStudioProtocolDiscovery} from '../preview-server/studio-protocol/handle-discovery';
import {handleStudioProtocolInstall} from '../preview-server/studio-protocol/handle-install';
import {handleStudioProtocolOptions} from '../preview-server/studio-protocol/origin-policy';

const payload = createElementPayload({
	dependencies: [],
	dimensions: {width: 800, height: 200},
	displayName: 'Lower Third',
	durationInFrames: 90,
	slug: 'lower-third',
	sourceCode: 'export const LowerThird = () => null;',
});

const sendUnfinishedOversizedInstallRequest = (
	url: string,
): Promise<{
	readonly body: unknown;
	readonly corsHeader: string | undefined;
	readonly statusCode: number;
}> => {
	return new Promise((resolve, reject) => {
		const parsedUrl = new URL(url);
		let responseText = '';
		let settled = false;
		const socket = connect(Number(parsedUrl.port), parsedUrl.hostname, () => {
			socket.write(
				`POST ${parsedUrl.pathname} HTTP/1.1\r\nHost: ${parsedUrl.host}\r\nOrigin: http://localhost:4000\r\nContent-Type: application/json\r\nTransfer-Encoding: chunked\r\nConnection: close\r\n\r\n`,
			);

			const writeChunk = (chunk: string) => {
				socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`);
			};

			writeChunk('{"padding":"');
			for (let index = 0; index < 65; index++) {
				writeChunk('x'.repeat(16_384));
			}
			// Deliberately omit the terminating zero-length chunk. The server must
			// respond once the streaming limit is exceeded, before the body ends.
		});
		const rejectOnce = (error: Error) => {
			if (settled) {
				return;
			}

			settled = true;
			clearTimeout(timeout);
			socket.destroy();
			reject(error);
		};

		const timeout = setTimeout(
			() => rejectOnce(new Error('Studio did not reject the unfinished body')),
			5_000,
		);
		socket.on('data', (chunk: Buffer) => {
			responseText += chunk.toString('utf8');
		});
		socket.on('error', rejectOnce);
		socket.on('end', () => {
			if (settled) {
				return;
			}

			settled = true;
			clearTimeout(timeout);
			try {
				const [headerText] = responseText.split('\r\n\r\n');
				const headerLines = headerText!.split('\r\n');
				const statusCode = Number(headerLines[0]!.split(' ')[1]);
				const corsHeader = headerLines
					.find((line) =>
						line.toLowerCase().startsWith('access-control-allow-origin:'),
					)
					?.slice('access-control-allow-origin:'.length)
					.trim();
				const jsonStart = responseText.indexOf('{');
				const jsonEnd = responseText.lastIndexOf('}');
				resolve({
					body: JSON.parse(responseText.slice(jsonStart, jsonEnd + 1)),
					corsHeader,
					statusCode,
				});
			} catch (error) {
				reject(error);
			}
		});
	});
};

test('discovers an exact Studio target and delivers one install request over HTTP', async () => {
	clearElementInstallStateForTests();
	const deliveredEvents: EventSourceEvent[] = [];
	const liveEventsServer: LiveEventsServer = {
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: (event) => {
			if (event.type !== 'request-element-install-target') {
				return;
			}

			updateElementInstallTarget({
				requestId: event.requestId,
				clientId: 'focused-studio-tab',
				compositionFile: '/tmp/protocol-project/src/Composition.tsx',
				compositionId: 'Main',
				canInstall: true,
				lastFocusedAt: Date.now(),
				readOnly: false,
				studioUrl: 'http://localhost:3000/Main',
			});
		},
		sendEventToClientId: (clientId, event) => {
			if (clientId !== 'focused-studio-tab') {
				return false;
			}

			deliveredEvents.push(event);
			return true;
		},
	};

	const server = createServer((request, response) => {
		const {pathname} = new URL(request.url ?? '/', 'http://localhost');
		if (request.method === 'OPTIONS') {
			handleStudioProtocolOptions({request, response}).catch((error) =>
				response.destroy(error),
			);
			return;
		}

		if (pathname === '/api/studio-protocol') {
			handleStudioProtocolDiscovery({
				gitSource: null,
				liveEventsServer,
				remotionRoot: '/tmp/protocol-project',
				request,
				response,
			}).catch((error) => response.destroy(error));
			return;
		}

		handleStudioProtocolInstall({
			focusStudioTab: () => undefined,
			liveEventsServer,
			request,
			response,
		}).catch((error) => response.destroy(error));
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

	try {
		const address = server.address();
		if (address === null || typeof address === 'string') {
			throw new Error('Expected an HTTP server address');
		}

		const origin = `http://127.0.0.1:${address.port}`;
		const preflight = await fetch(`${origin}/api/studio-protocol/install`, {
			method: 'OPTIONS',
			headers: {
				Origin: 'http://localhost:4000',
				'Access-Control-Request-Method': 'POST',
			},
		});
		expect(preflight.status).toBe(204);
		expect(preflight.headers.get('access-control-allow-origin')).toBe(
			'http://localhost:4000',
		);
		const disallowedResponse = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'https://example.com'},
		});
		expect(disallowedResponse.status).toBe(403);
		expect(await disallowedResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'unsupported-origin'},
		});

		const discoveryResponse = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'http://localhost:4000'},
		});
		expect(discoveryResponse.status).toBe(200);
		expect(discoveryResponse.headers.get('cache-control')).toBe('no-store');
		const descriptor = (await discoveryResponse.json()) as {
			installTarget: {id: string; compositionId: string};
		};
		expect(descriptor.installTarget.compositionId).toBe('Main');

		const installBody = {
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId: descriptor.installTarget.id,
			payload,
		};
		const invalidEnvelopeResponse = await fetch(
			`${origin}/api/studio-protocol/install`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'http://localhost:4000',
				},
				body: JSON.stringify({...installBody, protocolVersion: 2}),
			},
		);
		expect(invalidEnvelopeResponse.status).toBe(400);
		expect(await invalidEnvelopeResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'unsupported-protocol'},
		});

		const invalidPayloadResponse = await fetch(
			`${origin}/api/studio-protocol/install`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'http://localhost:4000',
				},
				body: JSON.stringify({...installBody, payload: {}}),
			},
		);
		expect(invalidPayloadResponse.status).toBe(400);
		expect(await invalidPayloadResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'invalid-payload'},
		});
		expect(deliveredEvents).toHaveLength(0);

		const oversizedResponse = await sendUnfinishedOversizedInstallRequest(
			`${origin}/api/studio-protocol/install`,
		);
		expect(oversizedResponse.statusCode).toBe(413);
		expect(oversizedResponse.corsHeader).toBe('http://localhost:4000');
		expect(oversizedResponse.body).toMatchObject({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'error',
			error: {code: 'request-too-large'},
		});
		expect(deliveredEvents).toHaveLength(0);

		const installResponse = await fetch(
			`${origin}/api/studio-protocol/install`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'http://localhost:4000',
				},
				body: JSON.stringify(installBody),
			},
		);
		expect(await installResponse.json()).toEqual({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'awaiting-confirmation',
		});
		expect(deliveredEvents).toHaveLength(1);
		expect(deliveredEvents[0]).toMatchObject({
			type: 'element-install-request',
			request: {
				clientId: 'focused-studio-tab',
				compositionFile: '/tmp/protocol-project/src/Composition.tsx',
				compositionId: 'Main',
				element: {displayName: 'Lower Third'},
				source: {
					type: 'studio-protocol',
					origin: 'http://localhost:4000',
				},
			},
		});

		const replayResponse = await fetch(
			`${origin}/api/studio-protocol/install`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'http://localhost:4000',
				},
				body: JSON.stringify(installBody),
			},
		);
		expect(replayResponse.status).toBe(409);
		expect(await replayResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'target-expired'},
		});
		expect(deliveredEvents).toHaveLength(1);
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
		clearElementInstallStateForTests();
	}
});
