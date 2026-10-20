import {afterEach, expect, spyOn, test} from 'bun:test';
import {LambdaClientInternals} from '@remotion/lambda-client';
import * as headFile from '../../../../lambda-client/src/head-file';
import {startCancellationPolling} from '../../functions/cancellation-polling';

const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

test('polls until the cancellation signal exists', async () => {
	let checks = 0;
	spies.push(
		spyOn(headFile, 'lambdaHeadFileImplementation').mockImplementation(
			({key}) => {
				expect(key).toBe(LambdaClientInternals.cancellationKey('render-id'));
				checks++;
				if (checks === 1) {
					const error = new Error('Missing');
					error.name = 'NotFound';
					return Promise.reject(error);
				}

				return Promise.resolve({});
			},
		),
	);
	let stop: () => void = () => undefined;
	const cancelled = new Promise<void>((resolve) => {
		stop = startCancellationPolling({
			bucketName: 'bucket',
			renderId: 'render-id',
			region: 'eu-central-1',
			forcePathStyle: false,
			intervalInMilliseconds: 1,
			logLevel: 'error',
			onCancelled: resolve,
		});
	});

	await cancelled;
	stop();
	expect(checks).toBe(2);
});
