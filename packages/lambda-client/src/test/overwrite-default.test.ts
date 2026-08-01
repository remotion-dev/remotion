import {expect, test} from 'bun:test';
import {ENABLE_V5_BREAKING_CHANGES} from '@remotion/serverless-client';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {renderMediaOnLambdaOptionalToRequired} from '../render-media-on-lambda';

const getOptions = () => ({
	region: 'us-east-1' as const,
	functionName: 'test-function',
	serveUrl: 'https://example.com',
	composition: 'test-composition',
	codec: 'h264' as const,
});

test('keeps an omitted overwrite value unresolved', () => {
	const options = renderMediaOnLambdaOptionalToRequired(getOptions());

	expect(options.overwrite).toBeUndefined();
});

test('preserves an explicit overwrite value', () => {
	const options = renderMediaOnLambdaOptionalToRequired({
		...getOptions(),
		overwrite: false,
	});

	expect(options.overwrite).toBe(false);
});

test('resolves an omitted overwrite value using the v5 flag', async () => {
	const options = renderMediaOnLambdaOptionalToRequired(getOptions());
	const payload = await makeLambdaRenderMediaPayload(options);

	expect(payload.overwrite).toBe(ENABLE_V5_BREAKING_CHANGES);
});
