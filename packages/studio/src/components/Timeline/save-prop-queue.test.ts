import {beforeAll, expect, mock, test} from 'bun:test';
import type {SequencePropsSubscriptionKey} from 'remotion';
import type {EnqueueSaveOptions} from './save-prop-queue';

type EnqueueSavePropChangeWithError = <TResponse>(
	options: EnqueueSaveOptions<TResponse> & {
		readonly onError: (error: unknown) => void;
	},
) => Promise<void>;

let enqueueSavePropChangeWithError: EnqueueSavePropChangeWithError;

beforeAll(async () => {
	mock.module('../Notifications/NotificationCenter', () => ({
		showNotification: () => undefined,
	}));
	({enqueueSavePropChangeWithError} = await import('./save-prop-queue'));
});

const makeNodePath = (id: string): SequencePropsSubscriptionKey => ({
	absolutePath: '/src/Composition.tsx',
	nodePath: [id],
	sequenceKeys: [],
	effectKeys: [],
	videoConfigValues: null,
});

test('reports queued sequence prop save errors to the caller', async () => {
	const error = new Error('Could not persist captions');
	const reportedErrors: unknown[] = [];

	await enqueueSavePropChangeWithError({
		nodePath: makeNodePath('captions'),
		setPropStatuses: () => undefined,
		applyOptimistic: (previous) => previous,
		apiCall: () => Promise.reject(error),
		errorLabel: 'Could not save sequence prop',
		onError: (saveError) => reportedErrors.push(saveError),
	});

	expect(reportedErrors).toEqual([error]);
});

test('reports a failed queue to later saves and allows a retry', async () => {
	const error = new Error('First caption save failed');
	const reportedErrors: unknown[] = [];
	const rejectFirstSave: {
		current: ((error: Error) => void) | null;
	} = {current: null};
	let secondApiCallCount = 0;
	const nodePath = makeNodePath('queued-captions');
	const common = {
		nodePath,
		setPropStatuses: () => undefined,
		applyOptimistic: <T>(previous: T) => previous,
		errorLabel: 'Could not save sequence prop',
	};

	const firstSave = enqueueSavePropChangeWithError({
		...common,
		apiCall: () =>
			new Promise<void>((_resolve, reject) => {
				rejectFirstSave.current = reject;
			}),
		onError: (saveError) => reportedErrors.push(saveError),
	});
	const secondSave = enqueueSavePropChangeWithError({
		...common,
		apiCall: () => {
			secondApiCallCount += 1;
			return Promise.resolve();
		},
		onError: (saveError) => reportedErrors.push(saveError),
	});

	if (rejectFirstSave.current === null) {
		await Promise.resolve();
	}

	if (rejectFirstSave.current === null) {
		throw new Error('Expected the first save to start');
	}

	rejectFirstSave.current(error);
	await Promise.all([firstSave, secondSave]);

	expect(reportedErrors).toEqual([error, error]);
	expect(secondApiCallCount).toBe(0);

	await enqueueSavePropChangeWithError({
		...common,
		apiCall: () => {
			secondApiCallCount += 1;
			return Promise.resolve();
		},
		onError: (saveError) => reportedErrors.push(saveError),
	});

	expect(secondApiCallCount).toBe(1);
	expect(reportedErrors).toEqual([error, error]);
});
