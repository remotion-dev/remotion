import {expect, test} from 'bun:test';
import {createElementPayload} from '../element-payload';
import {installInStudioWithDependencies} from '../install-in-studio';

const elementPayload = createElementPayload({
	dependencies: [],
	dimensions: {width: 800, height: 200},
	displayName: 'Lower Third',
	durationInFrames: 90,
	slug: 'lower-third',
	sourceCode: 'export const LowerThird = () => null;',
});

const descriptor = ({
	compositionId,
	lastFocusedAt,
	projectName,
	targetId,
}: {
	readonly compositionId: string;
	readonly lastFocusedAt: number;
	readonly projectName: string;
	readonly targetId: string;
}) => ({
	protocol: 'remotion-studio-protocol',
	protocolVersion: 1,
	studioVersion: '4.0.502',
	projectName,
	capabilities: [
		{
			type: 'install-element',
			payloadType: 'remotion-element',
			payloadVersions: [1],
			target: {
				id: targetId,
				expiresAt: 1_010_000,
				compositionId,
				lastFocusedAt,
			},
		},
	],
});

const jsonResponse = (value: unknown, status = 200) =>
	new Response(JSON.stringify(value), {
		headers: {'Content-Type': 'application/json'},
		status,
	});

const dependencies = {
	now: () => 1_000_000,
	pageOrigin: 'http://localhost:4000',
	ports: [3000, 3001],
};

test('delivers the payload to the exact most recently focused Studio target', async () => {
	const requests: Array<{url: string; options?: RequestInit}> = [];
	const fetchFn = (input: string | URL | Request, options?: RequestInit) => {
		const url = String(input);
		requests.push({url, options});
		if (url === 'http://localhost:3000/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse(
					descriptor({
						compositionId: 'Older',
						lastFocusedAt: 900_000,
						projectName: 'Older project',
						targetId: 'older-target',
					}),
				),
			);
		}

		if (url === 'http://localhost:3001/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse(
					descriptor({
						compositionId: 'Main',
						lastFocusedAt: 950_000,
						projectName: 'Newest project',
						targetId: 'newest-target',
					}),
				),
			);
		}

		if (url === 'http://localhost:3001/api/studio-protocol/install') {
			return Promise.resolve(
				jsonResponse({
					protocol: 'remotion-studio-protocol',
					protocolVersion: 1,
					status: 'awaiting-confirmation',
				}),
			);
		}

		return Promise.resolve(new Response(null, {status: 404}));
	};

	const result = await installInStudioWithDependencies(elementPayload, {
		...dependencies,
		fetchFn,
	});

	expect(result).toEqual({
		success: true,
		status: 'awaiting-confirmation',
		target: {
			projectName: 'Newest project',
			compositionId: 'Main',
			studioOrigin: 'http://localhost:3001',
			studioVersion: '4.0.502',
		},
	});
	const installRequest = requests.at(-1);
	expect(installRequest?.url).toBe(
		'http://localhost:3001/api/studio-protocol/install',
	);
	expect(JSON.parse(String(installRequest?.options?.body))).toEqual({
		operation: 'install-element',
		protocol: 'remotion-studio-protocol',
		protocolVersion: 1,
		targetId: 'newest-target',
		payload: elementPayload,
	});
});

test('distinguishes a compatible Studio without an installable target', async () => {
	const fetchFn = (input: string | URL | Request) => {
		const url = String(input);
		if (url === 'http://localhost:3000/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse({
					...descriptor({
						compositionId: 'Main',
						lastFocusedAt: 950_000,
						projectName: 'Project',
						targetId: 'target',
					}),
					capabilities: [
						{
							...descriptor({
								compositionId: 'Main',
								lastFocusedAt: 950_000,
								projectName: 'Project',
								targetId: 'target',
							}).capabilities[0],
							target: null,
						},
					],
				}),
			);
		}

		return Promise.resolve(new Response(null, {status: 404}));
	};

	expect(
		await installInStudioWithDependencies(elementPayload, {
			...dependencies,
			fetchFn,
		}),
	).toEqual({
		success: false,
		code: 'no-installable-target',
		message: 'Focus a writable composition in Remotion Studio, then try again.',
	});
});

test('returns an actionable result when no Studio is running', async () => {
	const result = await installInStudioWithDependencies(elementPayload, {
		...dependencies,
		fetchFn: () => Promise.resolve(new Response(null, {status: 404})),
	});

	expect(result).toEqual({
		success: false,
		code: 'no-compatible-studio',
		message: 'Start Remotion Studio and open a composition, then try again.',
	});
});

test('reports malformed discovery JSON as an invalid response', async () => {
	const fetchFn = (input: string | URL | Request) => {
		if (String(input) === 'http://localhost:3000/api/studio-protocol') {
			return Promise.resolve(
				new Response('not JSON', {
					headers: {'Content-Type': 'application/json'},
				}),
			);
		}

		return Promise.resolve(new Response(null, {status: 404}));
	};

	expect(
		await installInStudioWithDependencies(elementPayload, {
			...dependencies,
			ports: [3000],
			fetchFn,
		}),
	).toEqual({
		success: false,
		code: 'invalid-response',
		message: 'Remotion Studio returned an invalid Studio Protocol response.',
	});
});

test('reports a legacy Studio as requiring an upgrade without sending a payload', async () => {
	const requests: string[] = [];
	const fetchFn = (input: string | URL | Request) => {
		const url = String(input);
		requests.push(url);
		if (url === 'http://localhost:3000/api/element-install-target') {
			return Promise.resolve(
				jsonResponse({type: 'remotion-studio', canInstall: true}),
			);
		}

		return Promise.resolve(new Response(null, {status: 404}));
	};

	expect(
		await installInStudioWithDependencies(elementPayload, {
			...dependencies,
			fetchFn,
		}),
	).toEqual({
		success: false,
		code: 'studio-upgrade-required',
		message:
			'This Remotion Studio does not support the Remotion Studio Protocol. Upgrade Remotion to 4.0.502 or newer.',
	});
	expect(
		requests.some((url) => url.endsWith('/api/request-element-install')),
	).toBe(false);
});

test('returns a structured error when the selected target expired', async () => {
	const fetchFn = (input: string | URL | Request) => {
		const url = String(input);
		if (url.endsWith('/api/studio-protocol')) {
			return Promise.resolve(
				jsonResponse(
					descriptor({
						compositionId: 'Main',
						lastFocusedAt: 950_000,
						projectName: 'Project',
						targetId: 'expired-target',
					}),
				),
			);
		}

		return Promise.resolve(
			jsonResponse(
				{
					protocol: 'remotion-studio-protocol',
					protocolVersion: 1,
					status: 'error',
					error: {code: 'target-expired', message: 'Target expired'},
				},
				409,
			),
		);
	};

	expect(
		await installInStudioWithDependencies(elementPayload, {
			...dependencies,
			ports: [3000],
			fetchFn,
		}),
	).toEqual({
		success: false,
		code: 'target-expired',
		message: 'Target expired',
	});
});

test('reports a truncated install response as invalid', async () => {
	const fetchFn = (input: string | URL | Request) => {
		const url = String(input);
		if (url === 'http://localhost:3000/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse(
					descriptor({
						compositionId: 'Main',
						lastFocusedAt: 950_000,
						projectName: 'Project',
						targetId: 'target',
					}),
				),
			);
		}

		if (url === 'http://localhost:3000/api/studio-protocol/install') {
			return Promise.resolve(
				new Response('{"protocol":"remotion-studio-protocol"', {
					headers: {'Content-Type': 'application/json'},
				}),
			);
		}

		return Promise.resolve(new Response(null, {status: 404}));
	};

	expect(
		await installInStudioWithDependencies(elementPayload, {
			...dependencies,
			ports: [3000],
			fetchFn,
		}),
	).toEqual({
		success: false,
		code: 'invalid-response',
		message: 'Remotion Studio returned an invalid installation response.',
	});
});

test('does not probe Studio from a non-loopback HTTP origin', async () => {
	let requests = 0;
	const result = await installInStudioWithDependencies(elementPayload, {
		...dependencies,
		fetchFn: () => {
			requests++;
			return Promise.resolve(new Response(null, {status: 404}));
		},
		pageOrigin: 'http://example.com',
	});

	expect(result).toEqual({
		success: false,
		code: 'unsupported-origin',
		message:
			'Install in Studio is only supported on HTTPS websites and local development origins.',
	});
	expect(requests).toBe(0);
});
