import {afterEach, expect, spyOn, test} from 'bun:test';
import {Readable} from 'node:stream';
import type {WriteFile} from '../aws-operations';
import {internalCancelRenderOnLambda} from '../cancel-render-on-lambda';
import * as getAccountId from '../get-account-id';
import * as readFile from '../read-file';
import {cancellationKey, overallProgressKey} from '../shared-constants';
import * as writeFile from '../write-file';

const spies: {mockRestore: () => void}[] = [];

const installFakes = ({
	cancellationEnabled,
	onWrite,
}: {
	cancellationEnabled: boolean | undefined;
	onWrite: WriteFile;
}) => {
	spies.push(
		spyOn(getAccountId, 'getAccountIdImplementation').mockImplementation(() =>
			Promise.resolve('123456789012'),
		),
		spyOn(readFile, 'lambdaReadFileImplementation').mockImplementation(
			({key}) => {
				expect(key).toBe(overallProgressKey('render-id'));
				return Promise.resolve(
					Readable.from([Buffer.from(JSON.stringify({cancellationEnabled}))]),
				);
			},
		),
		spyOn(writeFile, 'lambdaWriteFileImplementation').mockImplementation(
			onWrite,
		),
	);
};

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

test('writes a cancellation signal for an opted-in render', async () => {
	let writes = 0;
	installFakes({
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
	});

	expect(writes).toBe(1);
});

test('rejects cancellation if the render did not opt in', async () => {
	let writes = 0;
	installFakes({
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
		}),
	).rejects.toThrow('enableCancellation: true');
	expect(writes).toBe(0);
});
