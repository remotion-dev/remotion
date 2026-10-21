import {expect, spyOn, test} from 'bun:test';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {renderMediaOnLambdaOptionalToRequired} from '../render-media-on-lambda';
import * as writeFileModule from '../write-file';

const makePayload = async (inputProps: Record<string, unknown>) => {
	const writeFile = spyOn(
		writeFileModule,
		'lambdaWriteFileImplementation',
	).mockImplementation(() => Promise.resolve());
	try {
		const payload = await makeLambdaRenderMediaPayload(
			renderMediaOnLambdaOptionalToRequired({
				region: 'us-east-1',
				functionName: 'test-function',
				serveUrl: 'https://example.com',
				composition: 'test-composition',
				codec: 'h264',
				inputProps,
				forceBucketName: 'remotionlambda-test',
			}),
		);
		return {payload, uploads: writeFile.mock.calls.length};
	} finally {
		writeFile.mockRestore();
	}
};

test('uploads CJK props that fit by character count but not by bytes', async () => {
	const {payload, uploads} = await makePayload({text: '字'.repeat(90_000)});

	expect(payload.inputProps.type).toBe('bucket-url');
	expect(uploads).toBe(1);
});

test('keeps ASCII props under the inline limit inline', async () => {
	const {payload, uploads} = await makePayload({text: 'a'.repeat(190_000)});

	expect(payload.inputProps.type).toBe('payload');
	expect(uploads).toBe(0);
});
