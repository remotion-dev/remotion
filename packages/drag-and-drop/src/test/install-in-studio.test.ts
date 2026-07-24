import {expect, test} from 'bun:test';
import {installInStudioWithDependencies} from '../install-in-studio';

const dragData = {
	mimeType: 'application/vnd.remotion.drag+json;v=1;type=element;duration=90',
	payload: '{"type":"remotion-element"}',
	data: {type: 'not-sent'},
};

const target = ({
	lastFocusedAt,
	projectName,
}: {
	lastFocusedAt: number;
	projectName: string;
}) => ({
	type: 'remotion-studio' as const,
	projectName,
	port: 3000,
	lastFocusedAt,
	canInstall: true,
	activeCompositionId: 'Main',
	readOnly: false,
});

const jsonResponse = (value: unknown, status = 200) => {
	return new Response(JSON.stringify(value), {
		headers: {'Content-Type': 'application/json'},
		status,
	});
};

test('installs into the most recently focused Studio', async () => {
	const requests: Array<{url: string; options?: RequestInit}> = [];
	const fetchFn = (input: string | URL | Request, options?: RequestInit) => {
		const url = String(input);
		requests.push({url, options});

		if (url === 'http://localhost:3000/api/element-install-target') {
			return Promise.resolve(
				jsonResponse(
					target({lastFocusedAt: 900_000, projectName: 'Older project'}),
				),
			);
		}

		if (url === 'http://localhost:3001/api/element-install-target') {
			return Promise.resolve(
				jsonResponse(
					target({lastFocusedAt: 950_000, projectName: 'Newest project'}),
				),
			);
		}

		if (url === 'http://localhost:3001/api/request-element-install') {
			return Promise.resolve(jsonResponse({success: true, status: 'sent'}));
		}

		return Promise.resolve(new Response(null, {status: 404}));
	};

	const result = await installInStudioWithDependencies(dragData, {
		fetchFn,
		now: () => 1_000_000,
		ports: [3000, 3001],
	});

	expect(result).toEqual({
		success: true,
		target: {
			...target({lastFocusedAt: 950_000, projectName: 'Newest project'}),
			origin: 'http://localhost:3001',
		},
	});
	expect(requests.at(-1)).toEqual({
		url: 'http://localhost:3001/api/request-element-install',
		options: {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				mimeType: dragData.mimeType,
				payload: dragData.payload,
			}),
			signal: expect.any(AbortSignal),
		},
	});
});

test('returns an actionable error if no focused Studio is available', async () => {
	const fetchFn = () => Promise.resolve(new Response(null, {status: 404}));

	const result = await installInStudioWithDependencies(dragData, {
		fetchFn,
		now: () => 1_000_000,
		ports: [3000],
	});

	expect(result).toEqual({
		success: false,
		reason:
			'Focus the Remotion Studio you want to install into, then click again.',
	});
});

test('returns the error from Studio if installation is rejected', async () => {
	const fetchFn = (input: string | URL | Request) => {
		const url = String(input);
		if (url.endsWith('/api/element-install-target')) {
			return Promise.resolve(
				jsonResponse(target({lastFocusedAt: 950_000, projectName: 'Project'})),
			);
		}

		return Promise.resolve(
			jsonResponse({success: false, reason: 'No active composition'}, 409),
		);
	};

	const result = await installInStudioWithDependencies(dragData, {
		fetchFn,
		now: () => 1_000_000,
		ports: [3000],
	});

	expect(result).toEqual({
		success: false,
		reason: 'No active composition',
	});
});
