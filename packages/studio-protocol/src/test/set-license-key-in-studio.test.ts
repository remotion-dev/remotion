import {expect, test} from 'bun:test';
import {setLicenseKeyInStudioWithDependencies} from '../set-license-key-in-studio';

const licenseKey = `rm_pub_${'a'.repeat(48)}`;
const now = 1_000_000;

const descriptor = ({
	lastFocusedAt,
	projectName,
	setLicenseKey = true,
	targetId,
}: {
	readonly lastFocusedAt: number;
	readonly projectName: string;
	readonly setLicenseKey?: boolean;
	readonly targetId: string;
}) => ({
	protocol: 'remotion-studio-protocol',
	protocolVersion: 1,
	studioVersion: '4.0.504',
	projectName,
	capabilities: [
		{
			type: 'install-element',
			payloadType: 'remotion-element',
			payloadVersions: [1],
			target: null,
		},
		...(setLicenseKey
			? [
					{
						type: 'set-license-key',
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
	pageOrigin: 'https://www.remotion.pro',
	ports: [3000, 3001],
};

test('requests confirmation in the most recently focused Studio project', async () => {
	const requests: Array<{
		readonly options?: RequestInit;
		readonly url: string;
	}> = [];
	const fetchFn = (input: string | URL | Request, options?: RequestInit) => {
		const url = String(input);
		requests.push({options, url});
		if (url === 'http://localhost:3000/api/studio-protocol') {
			return Promise.resolve(
				jsonResponse(
					descriptor({
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
		await setLicenseKeyInStudioWithDependencies(licenseKey, {
			...dependencies,
			fetchFn,
		}),
	).toEqual({
		success: true,
		status: 'awaiting-confirmation',
		target: {
			projectName: 'Focused project',
			studioOrigin: 'http://localhost:3001',
			studioVersion: '4.0.504',
		},
	});
	const request = requests.at(-1);
	expect(request?.url).toBe(
		'http://localhost:3001/api/studio-protocol/license-key',
	);
	expect(request?.options?.method).toBe('POST');
	expect(JSON.parse(String(request?.options?.body))).toEqual({
		operation: 'set-license-key',
		protocol: 'remotion-studio-protocol',
		protocolVersion: 1,
		targetId: 'focused-target',
		licenseKey,
	});
});

test('rejects unauthorized origins and malformed keys before discovery', async () => {
	let requests = 0;
	const fetchFn = () => {
		requests++;
		return Promise.resolve(new Response(null, {status: 404}));
	};

	expect(
		await setLicenseKeyInStudioWithDependencies(licenseKey, {
			...dependencies,
			fetchFn,
			pageOrigin: 'https://example.com',
		}),
	).toMatchObject({success: false, code: 'unsupported-origin'});
	expect(
		await setLicenseKeyInStudioWithDependencies('rm_sec_private', {
			...dependencies,
			fetchFn,
		}),
	).toMatchObject({success: false, code: 'invalid-license-key'});
	expect(requests).toBe(0);
});

test('distinguishes old Studios from a Studio without a focused target', async () => {
	const oldStudio = await setLicenseKeyInStudioWithDependencies(licenseKey, {
		...dependencies,
		ports: [3000],
		fetchFn: () =>
			Promise.resolve(
				jsonResponse(
					descriptor({
						lastFocusedAt: now,
						projectName: 'Old project',
						setLicenseKey: false,
						targetId: 'unused',
					}),
				),
			),
	});
	expect(oldStudio).toMatchObject({
		success: false,
		code: 'studio-upgrade-required',
	});

	const noTarget = await setLicenseKeyInStudioWithDependencies(licenseKey, {
		...dependencies,
		ports: [3000],
		fetchFn: () =>
			Promise.resolve(
				jsonResponse({
					...descriptor({
						lastFocusedAt: now,
						projectName: 'Project',
						targetId: 'unused',
					}),
					capabilities: descriptor({
						lastFocusedAt: now,
						projectName: 'Project',
						targetId: 'unused',
					}).capabilities.map((capability) =>
						capability.type === 'set-license-key'
							? {...capability, target: null}
							: capability,
					),
				}),
			),
	});
	expect(noTarget).toMatchObject({
		success: false,
		code: 'no-configurable-target',
	});
});

test('maps structured server errors and malformed responses', async () => {
	const run = (response: Response) =>
		setLicenseKeyInStudioWithDependencies(licenseKey, {
			...dependencies,
			ports: [3000],
			fetchFn: (input) =>
				String(input).endsWith('/api/studio-protocol')
					? Promise.resolve(
							jsonResponse(
								descriptor({
									lastFocusedAt: now,
									projectName: 'Project',
									targetId: 'target',
								}),
							),
						)
					: Promise.resolve(response),
		});

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
	expect(await run(new Response('not json'))).toMatchObject({
		success: false,
		code: 'invalid-response',
	});
});
