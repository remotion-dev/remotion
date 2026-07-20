import {beforeEach, expect, test} from 'bun:test';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {UpdateElementInstallTargetRequest} from '@remotion/studio-shared';
import {
	clearElementInstallStateForTests,
	getElementInstallTarget,
} from '../preview-server/element-install-state';
import {updateElementInstallTargetHandler} from '../preview-server/routes/update-element-install-target';

const validInput: UpdateElementInstallTargetRequest = {
	requestId: 'request-id',
	clientId: 'client-id',
	compositionFile: '/project/src/composition.tsx',
	compositionId: 'composition-id',
	canInstall: true,
	lastFocusedAt: 1000,
	readOnly: false,
	studioUrl: 'http://localhost:3000/composition-id',
};

const callHandler = ({
	input,
	origin,
}: {
	input: UpdateElementInstallTargetRequest;
	origin: string | undefined;
}) => {
	return updateElementInstallTargetHandler({
		binariesDirectory: null,
		entryPoint: '',
		input,
		logLevel: 'info',
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: '',
		remotionRoot: '',
		request: {headers: {origin}} as IncomingMessage,
		response: {} as ServerResponse,
	});
};

beforeEach(() => {
	clearElementInstallStateForTests();
});

test('stores a same-origin Studio URL', async () => {
	await callHandler({
		input: validInput,
		origin: 'http://localhost:3000',
	});

	expect(getElementInstallTarget('request-id')?.studioUrl).toBe(
		'http://localhost:3000/composition-id',
	);
});

test('rejects an invalid Studio URL', () => {
	expect(() =>
		callHandler({
			input: {...validInput, studioUrl: 'not a URL'},
			origin: 'http://localhost:3000',
		}),
	).toThrow('Invalid Studio URL');
});

test('rejects a cross-origin Studio URL', () => {
	expect(() =>
		callHandler({
			input: {...validInput, studioUrl: 'https://attacker.example'},
			origin: 'http://localhost:3000',
		}),
	).toThrow('Studio URL must match the request origin');
});
