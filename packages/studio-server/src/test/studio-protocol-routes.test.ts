import {expect, test} from 'bun:test';
import {createServer} from 'node:http';
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
