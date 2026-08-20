import {expect, test} from 'bun:test';
import {Readable} from 'node:stream';
import {
	cancellationKey,
	overallProgressKey,
	type ProviderSpecifics,
} from '@remotion/serverless-client';
import {awsImplementation, type AwsProvider} from '../aws-provider';
import {internalCancelRenderOnLambda} from '../cancel-render-on-lambda';

const makeProviderSpecifics = ({
	cancellationEnabled,
	onWrite,
}: {
	cancellationEnabled: boolean | undefined;
	onWrite: ProviderSpecifics<AwsProvider>['writeFile'];
}): ProviderSpecifics<AwsProvider> => {
	return {
		...awsImplementation,
		getAccountId: () => Promise.resolve('123456789012'),
		readFile: ({key}) => {
			expect(key).toBe(overallProgressKey('render-id'));
			return Promise.resolve(
				Readable.from([
					Buffer.from(
						JSON.stringify({
							cancellationEnabled,
						}),
					),
				]),
			);
		},
		writeFile: onWrite,
	};
};

test('writes a cancellation signal for an opted-in render', async () => {
	let writes = 0;
	const providerSpecifics = makeProviderSpecifics({
		cancellationEnabled: true,
		onWrite: (input) => {
			writes++;
			expect(input.bucketName).toBe('bucket');
			expect(input.key).toBe(cancellationKey('render-id'));
			expect(input.privacy).toBe('private');
			expect(JSON.parse(String(input.body)).cancelledAt).toBeNumber();
			return Promise.resolve();
		},
	});

	await internalCancelRenderOnLambda({
		bucketName: 'bucket',
		renderId: 'render-id',
		region: 'us-east-1',
		forcePathStyle: false,
		requestHandler: null,
		providerSpecifics,
	});

	expect(writes).toBe(1);
});

test('rejects cancellation if the render did not opt in', async () => {
	let writes = 0;
	const providerSpecifics = makeProviderSpecifics({
		cancellationEnabled: undefined,
		onWrite: () => {
			writes++;
			return Promise.resolve();
		},
	});

	await expect(
		internalCancelRenderOnLambda({
			bucketName: 'bucket',
			renderId: 'render-id',
			region: 'us-east-1',
			forcePathStyle: false,
			requestHandler: null,
			providerSpecifics,
		}),
	).rejects.toThrow('enableCancellation: true');
	expect(writes).toBe(0);
});
