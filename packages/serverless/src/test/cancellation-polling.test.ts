import {expect, test} from 'bun:test';
import type {
	CloudProvider,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import {cancellationKey} from '@remotion/serverless-client';
import {startCancellationPolling} from '../cancellation-polling';

type MockProvider = CloudProvider<
	'eu-central-1',
	{s3Key: string; s3Url: string},
	{},
	'standard',
	{}
>;

test('polls until the cancellation signal exists', async () => {
	let checks = 0;
	let stop: () => void = () => undefined;
	const cancelled = new Promise<void>((resolve) => {
		stop = startCancellationPolling({
			bucketName: 'bucket',
			renderId: 'render-id',
			region: 'eu-central-1',
			providerSpecifics: {
				headFile: (({key}) => {
					expect(key).toBe(cancellationKey('render-id'));
					checks++;
					if (checks === 1) {
						const error = new Error('Missing');
						error.name = 'NotFound';
						return Promise.reject(error);
					}

					return Promise.resolve({});
				}) as ProviderSpecifics<MockProvider>['headFile'],
			} as unknown as ProviderSpecifics<MockProvider>,
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
