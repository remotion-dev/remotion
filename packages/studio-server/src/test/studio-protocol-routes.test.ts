import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {createServer, request as httpRequest} from 'node:http';
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
import {handleStudioProtocolElementLibrary} from '../preview-server/studio-protocol/handle-element-library';
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
		let settled = false;
		const clientRequest = httpRequest(url, {
			method: 'POST',
			headers: {
				Origin: 'http://localhost:4000',
				'Content-Type': 'application/json',
				'Transfer-Encoding': 'chunked',
				Connection: 'close',
			},
		});
		const rejectOnce = (error: Error) => {
			if (settled) {
				return;
			}

			settled = true;
			clearTimeout(timeout);
			clientRequest.destroy();
			reject(error);
		};

		const timeout = setTimeout(
			() => rejectOnce(new Error('Studio did not reject the unfinished body')),
			5_000,
		);
		clientRequest.on('error', rejectOnce);
		clientRequest.on('response', (response) => {
			let responseText = '';
			response.setEncoding('utf8');
			response.on('data', (chunk: string) => {
				responseText += chunk;
			});
			response.on('error', rejectOnce);
			response.on('end', () => {
				if (settled) {
					return;
				}

				if (!response.complete || response.statusCode === undefined) {
					rejectOnce(new Error('Studio returned an incomplete HTTP response'));
					return;
				}

				settled = true;
				clearTimeout(timeout);
				clientRequest.destroy();
				try {
					resolve({
						body: JSON.parse(responseText),
						corsHeader: response.headers['access-control-allow-origin'],
						statusCode: response.statusCode,
					});
				} catch (error) {
					reject(error);
				}
			});
		});
		clientRequest.write('{"padding":"');
		for (let index = 0; index < 65; index++) {
			clientRequest.write('x'.repeat(16_384));
		}
		// Deliberately omit end(), keeping the chunked request unfinished. Resolve
		// on the complete HTTP response, without waiting for the connection to close.
	});
};

test('discovers a sole unfocused Studio without a composition and delivers one install request over HTTP', async () => {
	clearElementInstallStateForTests();
	const deliveredEvents: EventSourceEvent[] = [];
	const liveEventsServer: LiveEventsServer = {
		getClientIds: () => ['focused-studio-tab'],
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
				lastFocusedAt: null,
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
					target: {
						id: string;
						compositionId: string | null;
						lastFocusedAt: number | null;
					};
				},
			];
		};
		const installTarget = descriptor.capabilities[0].target;
		expect(installTarget.compositionId).toBe(null);
		expect(installTarget.lastFocusedAt).toBe(null);
		expect(descriptor.capabilities.slice(1)).toMatchObject([
			{target: null},
			{target: null},
		]);

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
				compositionFile: null,
				compositionId: null,
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

test('delivers an Element Library request without changing config before confirmation', async () => {
	clearElementInstallStateForTests();
	const deliveredEvents: EventSourceEvent[] = [];
	const focusedUrls: string[] = [];
	const directory = mkdtempSync(
		path.join(tmpdir(), 'remotion-element-library-protocol-'),
	);
	const configFile = path.join(directory, 'remotion.config.ts');
	const configContents = [
		"import {Config} from '@remotion/cli/config';",
		"Config.addElementLibrary({url: 'https://existing.example.com/'});",
		'',
	].join('\n');
	writeFileSync(configFile, configContents);
	let loadedConfigFile: string | null = configFile;
	const liveEventsServer: LiveEventsServer = {
		getClientIds: () => ['focused-studio-tab'],
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
			handleStudioProtocolOptions({request, response}).catch((error) =>
				response.destroy(error),
			);
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

		handleStudioProtocolElementLibrary({
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
		const requestOrigin = 'https://library.example.com';
		const preflight = await fetch(
			`${origin}/api/studio-protocol/element-library`,
			{method: 'OPTIONS', headers: {Origin: requestOrigin}},
		);
		expect(preflight.status).toBe(204);
		expect(preflight.headers.get('access-control-allow-origin')).toBe(
			requestOrigin,
		);

		const discover = async () => {
			const discoveryResponse = await fetch(`${origin}/api/studio-protocol`, {
				headers: {Origin: requestOrigin},
			});
			const descriptor = (await discoveryResponse.json()) as {
				capabilities: [
					{type: 'install-element'},
					{type: 'set-license-key'},
					{type: 'add-element-library'; target: {id: string}},
				];
			};
			return descriptor.capabilities[2].target.id;
		};

		let targetId = await discover();
		const body = {
			operation: 'add-element-library',
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			targetId,
			url: 'https://new.example.com/library',
			displayName: '  New library  ',
		};

		for (const invalidBody of [
			{...body, protocolVersion: 2},
			{...body, url: 'file:///tmp/library'},
			{...body, displayName: '  '},
		]) {
			const invalidResponse = await fetch(
				`${origin}/api/studio-protocol/element-library`,
				{
					method: 'POST',
					headers: {'Content-Type': 'application/json', Origin: requestOrigin},
					body: JSON.stringify(invalidBody),
				},
			);
			expect(invalidResponse.status).toBe(400);
		}

		expect(deliveredEvents).toHaveLength(0);

		const wrongOriginResponse = await fetch(
			`${origin}/api/studio-protocol/element-library`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Origin: 'https://other.example.com',
				},
				body: JSON.stringify(body),
			},
		);
		expect(wrongOriginResponse.status).toBe(409);
		expect(deliveredEvents).toHaveLength(0);

		targetId = await discover();
		const validBody = {...body, targetId};
		const response = await fetch(
			`${origin}/api/studio-protocol/element-library`,
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json', Origin: requestOrigin},
				body: JSON.stringify(validBody),
			},
		);
		expect(await response.json()).toEqual({
			protocol: 'remotion-studio-protocol',
			protocolVersion: 1,
			status: 'awaiting-confirmation',
		});
		expect(deliveredEvents).toEqual([
			{
				type: 'element-library-add-request',
				captionStylesUrl: null,
				url: 'https://new.example.com/library',
				displayName: 'New library',
				origin: requestOrigin,
			},
		]);
		expect(focusedUrls).toEqual(['http://localhost:3000']);
		expect(readFileSync(configFile, 'utf8')).toBe(configContents);

		const replay = await fetch(
			`${origin}/api/studio-protocol/element-library`,
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json', Origin: requestOrigin},
				body: JSON.stringify(validBody),
			},
		);
		expect(replay.status).toBe(409);
		expect(deliveredEvents).toHaveLength(1);

		targetId = await discover();
		loadedConfigFile = null;
		const noConfigResponse = await fetch(
			`${origin}/api/studio-protocol/element-library`,
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json', Origin: requestOrigin},
				body: JSON.stringify({...body, targetId}),
			},
		);
		expect(noConfigResponse.status).toBe(409);
		expect(await noConfigResponse.json()).toMatchObject({
			status: 'error',
			error: {code: 'no-config-file'},
		});
		expect(deliveredEvents).toHaveLength(1);
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
		rmSync(directory, {recursive: true, force: true});
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
		getClientIds: () => ['focused-studio-tab'],
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
		const licenseKeyPreflight = await fetch(
			`${origin}/api/studio-protocol/license-key`,
			{
				method: 'OPTIONS',
				headers: {Origin: 'https://example.com'},
			},
		);
		expect(licenseKeyPreflight.status).toBe(204);
		expect(licenseKeyPreflight.headers.get('access-control-allow-origin')).toBe(
			'https://example.com',
		);

		const discovery = await fetch(`${origin}/api/studio-protocol`, {
			headers: {Origin: 'https://example.com'},
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
					Origin: 'https://example.com',
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
				Origin: 'https://example.com',
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
				Origin: 'https://example.com',
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
			headers: {Origin: 'https://example.com'},
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
					Origin: 'https://example.com',
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

// The focused CI tab replied after 267 ms; the former 250 ms window issued a token
// for the faster, less recently focused tab instead.
const withDiscoveryClients = async (
	clients: Set<string>,
	onRequest: (
		requestId: string,
		reply: (delay: number, clientId: string, lastFocusedAt: number) => void,
	) => void,
	run: (
		discover: (signal?: AbortSignal) => Promise<{
			capabilities: {target: {compositionId: string} | null}[];
		}>,
		handled: Promise<void>,
	) => Promise<void>,
) => {
	const timers: ReturnType<typeof setTimeout>[] = [];
	const liveEventsServer: LiveEventsServer = {
		getClientIds: () => [...clients],
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClientId: () => false,
		sendEventToClient: (event) => {
			if (event.type !== 'request-element-install-target') return;
			onRequest(event.requestId, (delay, clientId, lastFocusedAt) => {
				timers.push(
					setTimeout(
						() =>
							updateElementInstallTarget({
								requestId: event.requestId,
								clientId,
								compositionFile: '/src/Root.tsx',
								compositionId: clientId,
								lastFocusedAt,
								readOnly: false,
								studioUrl: 'http://localhost:3000',
							}),
						delay,
					),
				);
			});
		},
	};
	let markHandled: () => void;
	const handled = new Promise<void>((resolve) => {
		markHandled = resolve;
	});
	const server = createServer((request, response) => {
		handleStudioProtocolDiscovery({
			gitSource: null,
			liveEventsServer,
			remotionRoot: '/tmp/discovery-race',
			request,
			response,
		}).then(
			() => markHandled(),
			(error) => {
				markHandled();
				response.destroy(error);
			},
		);
	});
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	try {
		const address = server.address();
		if (address === null || typeof address === 'string')
			throw new Error('Expected HTTP address');
		await run(async (signal = AbortSignal.timeout(1900)) => {
			const response = await fetch(
				`http://127.0.0.1:${address.port}/api/studio-protocol`,
				{headers: {Origin: 'https://example.com'}, signal},
			);
			expect(response.status).toBe(200);
			return response.json();
		}, handled);
	} finally {
		for (const timer of timers) clearTimeout(timer);
		await new Promise<void>((resolve, reject) =>
			server.close((error) => (error ? reject(error) : resolve())),
		);
	}
};

test('discovery waits for a later, more recently focused connected editor', async () => {
	clearElementInstallStateForTests();
	await withDiscoveryClients(
		new Set(['decoy', 'focused']),
		(_requestId, reply) => {
			reply(40, 'decoy', 1);
			reply(350, 'focused', 2);
		},
		async (discover) => {
			const descriptor = await discover();
			expect(descriptor.capabilities[0].target?.compositionId).toBe('focused');
		},
	);
});

test('discovery completes promptly when the connected editor responds', async () => {
	clearElementInstallStateForTests();
	await withDiscoveryClients(
		new Set(['focused']),
		(_requestId, reply) => reply(0, 'focused', 2),
		async (discover) => {
			const descriptor = await discover(AbortSignal.timeout(500));
			expect(descriptor.capabilities[0].target?.compositionId).toBe('focused');
		},
	);
});

test('discovery with no connected clients returns no target without waiting for the response budget', async () => {
	clearElementInstallStateForTests();
	await withDiscoveryClients(
		new Set(),
		() => undefined,
		async (discover) => {
			const descriptor = await discover(AbortSignal.timeout(500));
			expect(
				descriptor.capabilities.every(
					(capability) => capability.target === null,
				),
			).toBe(true);
		},
	);
});

test('discovery bounds non-editor live clients without discarding the responding editor', async () => {
	clearElementInstallStateForTests();
	await withDiscoveryClients(
		new Set(['focused', 'ssr-client']),
		(_requestId, reply) => reply(0, 'focused', 2),
		async (discover) => {
			const descriptor = await discover();
			expect(descriptor.capabilities[0].target?.compositionId).toBe('focused');
		},
	);
});

test('discovery does not issue a target for an editor disconnected before collection completes', async () => {
	clearElementInstallStateForTests();
	const clients = new Set(['focused', 'remaining']);
	await withDiscoveryClients(
		clients,
		(_requestId, reply) => {
			reply(0, 'focused', 2);
			clients.delete('focused');
			reply(30, 'remaining', 1);
		},
		async (discover) => {
			const descriptor = await discover();
			expect(descriptor.capabilities[0].target?.compositionId).toBe(
				'remaining',
			);
		},
	);
});

test('overlapping discoveries retain their own responses when latest-client state is overwritten', async () => {
	clearElementInstallStateForTests();
	let requests = 0;
	await withDiscoveryClients(
		new Set(['decoy', 'focused']),
		(_requestId, reply) => {
			const first = ++requests === 1;
			reply(first ? 10 : 30, 'decoy', 1);
			reply(first ? 90 : 60, 'focused', 2);
		},
		async (discover) => {
			const descriptors = await Promise.all([discover(), discover()]);
			for (const descriptor of descriptors)
				expect(descriptor.capabilities[0].target?.compositionId).toBe(
					'focused',
				);
		},
	);
});

test('closing a discovery response releases its pending collection before the timeout', async () => {
	clearElementInstallStateForTests();
	await withDiscoveryClients(
		new Set(['silent']),
		() => undefined,
		async (discover, handled) => {
			await expect(discover(AbortSignal.timeout(30))).rejects.toThrow();
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(
					() => reject(new Error('Aborted discovery collection was retained')),
					500,
				);
				handled.then(() => {
					clearTimeout(timeout);
					resolve();
				}, reject);
			});
		},
	);
});
