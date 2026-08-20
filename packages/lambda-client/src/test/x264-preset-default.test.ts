import {expect, test} from 'bun:test';
import {ENABLE_V5_BREAKING_CHANGES} from '@remotion/serverless-client';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {
	type RenderMediaOnLambdaInput,
	renderMediaOnLambdaOptionalToRequired,
} from '../render-media-on-lambda';

const makePayload = ({
	codec,
	x264Preset,
}: Pick<RenderMediaOnLambdaInput, 'codec' | 'x264Preset'>) => {
	return makeLambdaRenderMediaPayload(
		renderMediaOnLambdaOptionalToRequired({
			region: 'us-east-1',
			functionName: 'test-function',
			serveUrl: 'https://example.com',
			composition: 'test-composition',
			codec,
			x264Preset,
		}),
	);
};

test('resolves the Lambda x264 preset based on the v5 flag', async () => {
	const defaultH264Payload = await makePayload({
		codec: 'h264',
		x264Preset: undefined,
	});
	const explicitH264Payload = await makePayload({
		codec: 'h264',
		x264Preset: 'medium',
	});
	const vp8Payload = await makePayload({
		codec: 'vp8',
		x264Preset: undefined,
	});

	expect(defaultH264Payload.x264Preset).toBe(
		ENABLE_V5_BREAKING_CHANGES ? 'veryfast' : null,
	);
	expect(explicitH264Payload.x264Preset).toBe('medium');
	expect(vp8Payload.x264Preset).toBe(null);
});
