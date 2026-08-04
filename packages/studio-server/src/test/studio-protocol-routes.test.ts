import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {connect} from 'node:net';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createElementPayload} from '@remotion/studio-protocol';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {
	clearElementInstallStateForTests,
	updateElementInstallTarget,
} from '../preview-server/element-install-state';
import type {LiveEventsServer} from '../preview-server/live-events';
import {handleStudioProtocolDiscovery} from '../preview-server/studio-protocol/handle-discovery';
import {handleStudioProtocolInstall} from '../preview-server/studio-protocol/handle-install';
import {handleStudioProtocolLicenseKey} from '../preview-server/studio-protocol/handle-license-key';
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
			handleStudioProtocolOptions({
				licenseKey: false,
				request,
				response,
			}).catch((error) => response.destroy(error));
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
				Origin: 'https://example.com',
				'Access-Control-Request-Method': 'POST',
			},
		});
		expect(preflight.status).toBe(204);
		expect(preflight.headers.get('access-control-allow-origin')).toBe(
			'https://example.com',
		);
		const disallowedResponse = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'http://example.com'},
		});
		expect(disallowedResponse.status).toBe(403);
		expect(await disallowedResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'unsupported-origin'},
		});

		const discoveryResponse = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'https://example.com'},
		});
		expect(discoveryResponse.status).toBe(200);
		expect(discoveryResponse.headers.get('cache-control')).toBe('no-store');
		const descriptor = (await discoveryResponse.json()) as {
			capabilities: [
				{
					type: 'install-element';
					target: {id: string; compositionId: string};
				},
			];
		};
		const installTarget = descriptor.capabilities[0].target;
		expect(installTarget.compositionId).toBe('Main');

		const installBody = {
			operation: 'install-element',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId: installTarget.id,
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

		const invalidDependencyResponse = await fetch(
			`${origin}/api/studio-protocol/install`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'http://localhost:4000',
				},
				body: JSON.stringify({
					...installBody,
					payload: {
						...payload,
						element: {
							...payload.element,
							dependencies: [{name: 'lodash', version: null}],
						},
					},
				}),
			},
		);
		expect(invalidDependencyResponse.status).toBe(400);
		expect(await invalidDependencyResponse.json()).toMatchObject({
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
					Origin: 'https://example.com',
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
					origin: 'https://example.com',
				},
			},
		});

		const replayResponse = await fetch(
			`${origin}/api/studio-protocol/install`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'https://example.com',
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

test('opens a license key confirmation in the focused Studio project over HTTP', async () => {
	clearElementInstallStateForTests();
	const deliveredEvents: EventSourceEvent[] = [];
	const focusedUrls: string[] = [];
	const directory = mkdtempSync(
		path.join(tmpdir(), 'remotion-license-protocol-'),
	);
	const configFile = path.join(directory, 'remotion.config.ts');
	let loadedConfigFile: string | null = configFile;
	writeFileSync(
		configFile,
		[
			"import {Config} from '@remotion/cli/config';",
			"Config.setPublicLicenseKey('rm_pub_old');",
			'',
		].join('\n'),
	);
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
				compositionFile: null,
				compositionId: null,
				canInstall: false,
				lastFocusedAt: Date.now(),
				readOnly: false,
				studioUrl: 'http://localhost:3000',
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
			handleStudioProtocolOptions({
				licenseKey: pathname === '/api/studio-protocol/license-key',
				request,
				response,
			}).catch((error) => response.destroy(error));
			return;
		}

		if (pathname === '/api/studio-protocol') {
			handleStudioProtocolDiscovery({
				gitSource: null,
				liveEventsServer,
				remotionRoot: directory,
				request,
				response,
			}).catch((error) => response.destroy(error));
			return;
		}

		handleStudioProtocolLicenseKey({
			configFile: loadedConfigFile,
			focusStudioTab: (studioUrl) => focusedUrls.push(studioUrl),
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
		const deniedPreflight = await fetch(
			`${origin}/api/studio-protocol/license-key`,
			{
				method: 'OPTIONS',
				headers: {Origin: 'https://example.com'},
			},
		);
		expect(deniedPreflight.status).toBe(403);
		expect(
			deniedPreflight.headers.get('access-control-allow-origin'),
		).toBeNull();

		const untrustedDiscovery = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'https://example.com'},
		});
		expect(untrustedDiscovery.status).toBe(200);
		expect(await untrustedDiscovery.json()).toMatchObject({
			capabilities: [
				{type: 'install-element', target: null},
				{type: 'set-license-key', target: null},
			],
		});

		const discovery = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'https://www.remotion.pro'},
		});
		const descriptor = (await discovery.json()) as {
			capabilities: [
				{type: 'install-element'},
				{type: 'set-license-key'; target: {id: string}},
			];
		};
		const licenseKeyTarget = descriptor.capabilities[1].target;
		expect(licenseKeyTarget.id).toBeString();

		const validLicenseKey = `rm_pub_${'a'.repeat(48)}`;
		const body = {
			operation: 'set-license-key',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId: licenseKeyTarget.id,
			licenseKey: validLicenseKey,
		};
		const invalidKeyResponse = await fetch(
			`${origin}/api/studio-protocol/license-key`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'https://www.remotion.pro',
				},
				body: JSON.stringify({...body, licenseKey: 'rm_sec_private'}),
			},
		);
		expect(invalidKeyResponse.status).toBe(400);
		expect(await invalidKeyResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'invalid-license-key'},
		});
		expect(readFileSync(configFile, 'utf8')).toContain('rm_pub_old');

		const response = await fetch(`${origin}/api/studio-protocol/license-key`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Origin: 'https://www.remotion.pro',
			},
			body: JSON.stringify(body),
		});
		expect(await response.json()).toEqual({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'awaiting-confirmation',
		});
		expect(readFileSync(configFile, 'utf8')).toContain('rm_pub_old');
		expect(deliveredEvents).toEqual([
			{
				type: 'license-key-install-request',
				licenseKey: validLicenseKey,
			},
		]);
		expect(focusedUrls).toEqual(['http://localhost:3000']);

		const replay = await fetch(`${origin}/api/studio-protocol/license-key`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Origin: 'https://www.remotion.pro',
			},
			body: JSON.stringify(body),
		});
		expect(replay.status).toBe(409);
		expect(await replay.json()).toMatchObject({
			status: 'error',
			error: {code: 'target-expired'},
		});
		expect(deliveredEvents).toHaveLength(1);
		expect(focusedUrls).toHaveLength(1);

		const noConfigDiscovery = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'https://www.remotion.pro'},
		});
		const noConfigDescriptor = (await noConfigDiscovery.json()) as {
			capabilities: [
				{type: 'install-element'},
				{type: 'set-license-key'; target: {id: string}},
			];
		};
		loadedConfigFile = null;
		const noConfigResponse = await fetch(
			`${origin}/api/studio-protocol/license-key`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'https://www.remotion.pro',
				},
				body: JSON.stringify({
					...body,
					targetId: noConfigDescriptor.capabilities[1].target.id,
				}),
			},
		);
		expect(noConfigResponse.status).toBe(409);
		expect(await noConfigResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'no-config-file'},
		});
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
		rmSync(directory, {recursive: true, force: true});
		clearElementInstallStateForTests();
	}
});
