import {expect, test} from 'bun:test';
import {addElementLibraryToStudioWithDependencies} from '../add-element-library-to-studio';
import type {StudioProtocolFetcher} from '../studio-discovery';

const now = 1_000_000;

const descriptor = ({
	addElementLibrary,
	lastFocusedAt,
	projectName,
	targetId,
}: {
	readonly addElementLibrary: boolean;
	readonly lastFocusedAt: number;
	readonly projectName: string;
	readonly targetId: string;
}) => ({
	protocol: 'remotion-studio-protocol',
	protocolVersion: 1,
	studioVersion: '4.0.518',
	projectName,
	capabilities: [
		{
			type: 'install-element',
			payloadType: 'remotion-element',
			payloadVersions: [1],
			target: null,
		},
		...(addElementLibrary
			? [
					{
						type: 'add-element-library',
						target: {
							id: targetId,
							expiresAt: now + 10_000,
							lastFocusedAt,
						},
					},
				]
			: []),
	],
});

const jsonResponse = (value: unknown, status = 200) =>
	new Response(JSON.stringify(value), {
		headers: {'Content-Type': 'application/json'},
		status,
	});

const dependencies = {
	now: () => now,
	pageOrigin: 'https://elements.example.com',
	ports: [3000, 3001],
};

test('requests confirmation in the most recently focused compatible Studio', async () => {
	const requests: Array<{
		readonly options: RequestInit | null;
		readonly url: string;
	}> = [];
	const fetchFn: StudioProtocolFetcher = (input, options) => {
		const url = String(input);
		requests.push({options: options ?? null, url});
		if (url === 'http://localhost:3000/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse(
					descriptor({
						addElementLibrary: true,
						lastFocusedAt: now - 200,
						projectName: 'Older',
						targetId: 'older-target',
					}),
				),
			);
		}

		if (url === 'http://localhost:3001/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse(
					descriptor({
						addElementLibrary: true,
						lastFocusedAt: now - 100,
						projectName: 'Focused project',
						targetId: 'focused-target',
					}),
				),
			);
		}

		return Promise.resolve(
			jsonResponse({
				protocol: 'remotion-studio-protocol',
				protocolVersion: 1,
				status: 'awaiting-confirmation',
			}),
		);
	};

	expect(
		await addElementLibraryToStudioWithDependencies(
			{url: 'https://catalog.example.com', displayName: '  Catalog  '},
			{...dependencies, fetchFn},
		),
	).toEqual({
		success: true,
		status: 'awaiting-confirmation',
		target: {
			projectName: 'Focused project',
			studioOrigin: 'http://localhost:3001',
			studioVersion: '4.0.518',
		},
	});
	const request = requests.at(-1);
	expect(request?.url).toBe(
		'http://localhost:3001/api/studio-protocol/element-library',
	);
	expect(request?.options?.method).toBe('POST');
	expect(JSON.parse(String(request?.options?.body))).toEqual({
		operation: 'add-element-library',
		protocol: 'remotion-studio-protocol',
		protocolVersion: 1,
		targetId: 'focused-target',
		url: 'https://catalog.example.com/',
		displayName: 'Catalog',
	});
});

test('returns an actionable result when no Studio is running', async () => {
	const requests: string[] = [];
	const result = await addElementLibraryToStudioWithDependencies(
		{url: 'https://catalog.example.com', displayName: null},
		{
			...dependencies,
			fetchFn: (input) => {
				requests.push(String(input));
				return Promise.resolve(new Response(null, {status: 404}));
			},
		},
	);

	expect(result).toEqual({
		success: false,
		code: 'no-compatible-studio',
		message: 'Start Remotion Studio, focus it, and try again.',
	});
	expect(requests).toEqual([
		'http://localhost:3000/api/studio-protocol',
		'http://localhost:3001/api/studio-protocol',
	]);
});

test('validates the request before probing localhost', async () => {
	for (const request of [
		{url: '/relative', displayName: null},
		{url: 'file:///tmp/catalog', displayName: null},
		{url: 'https://catalog.example.com', displayName: '  '},
	]) {
		let requestCount = 0;
		const result = await addElementLibraryToStudioWithDependencies(request, {
			...dependencies,
			fetchFn: () => {
				requestCount++;
				return Promise.resolve(new Response(null, {status: 404}));
			},
		});
		expect(result.success).toBe(false);
		expect(requestCount).toBe(0);
	}

	let probes = 0;
	const unsupportedOrigin = await addElementLibraryToStudioWithDependencies(
		{url: 'https://catalog.example.com', displayName: null},
		{
			...dependencies,
			pageOrigin: 'http://elements.example.com',
			fetchFn: () => {
				probes++;
				return Promise.resolve(new Response(null, {status: 404}));
			},
		},
	);
	expect(unsupportedOrigin).toMatchObject({
		success: false,
		code: 'unsupported-origin',
	});
	expect(probes).toBe(0);
});

test('distinguishes an old Studio from one without a focused target', async () => {
	const oldStudio = await addElementLibraryToStudioWithDependencies(
		{url: 'https://catalog.example.com', displayName: null},
		{
			...dependencies,
			ports: [3000],
			fetchFn: () =>
				Promise.resolve(
					jsonResponse(
						descriptor({
							addElementLibrary: false,
							lastFocusedAt: now,
							projectName: 'Old project',
							targetId: 'unused',
						}),
					),
				),
		},
	);
	expect(oldStudio).toMatchObject({
		success: false,
		code: 'studio-upgrade-required',
	});

	const withoutTarget = descriptor({
		addElementLibrary: true,
		lastFocusedAt: now,
		projectName: 'Project',
		targetId: 'unused',
	});
	const noTarget = await addElementLibraryToStudioWithDependencies(
		{url: 'https://catalog.example.com', displayName: null},
		{
			...dependencies,
			ports: [3000],
			fetchFn: () =>
				Promise.resolve(
					jsonResponse({
						...withoutTarget,
						capabilities: withoutTarget.capabilities.map((capability) =>
							capability.type === 'add-element-library'
								? {...capability, target: null}
								: capability,
						),
					}),
				),
		},
	);
	expect(noTarget).toMatchObject({
		success: false,
		code: 'no-configurable-target',
	});
});

test('maps structured server errors and malformed responses', async () => {
	const run = (response: Response) =>
		addElementLibraryToStudioWithDependencies(
			{url: 'https://catalog.example.com', displayName: null},
			{
				...dependencies,
				ports: [3000],
				fetchFn: (input) =>
					String(input).endsWith('/api/studio-protocol')
						? Promise.resolve(
								jsonResponse(
									descriptor({
										addElementLibrary: true,
										lastFocusedAt: now,
										projectName: 'Project',
										targetId: 'target',
									}),
								),
							)
						: Promise.resolve(response),
			},
		);

	expect(
		await run(
			jsonResponse(
				{
					status: 'error',
					error: {code: 'no-config-file', message: 'No config'},
				},
				409,
			),
		),
	).toEqual({success: false, code: 'no-config-file', message: 'No config'});
	expect(
		await run(
			jsonResponse(
				{
					status: 'error',
					error: {code: 'target-expired', message: 'Expired'},
				},
				409,
			),
		),
	).toEqual({success: false, code: 'target-expired', message: 'Expired'});
	expect(await run(new Response('not json'))).toMatchObject({
		success: false,
		code: 'invalid-response',
	});
});
