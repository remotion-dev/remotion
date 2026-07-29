import {expect, test} from 'bun:test';
import {renderMediaOnLambda} from '../render-media-on-lambda';

test('rejects multiple frame ranges before invoking Lambda', () => {
	expect(() =>
		renderMediaOnLambda({
			region: 'us-east-1',
			functionName: 'remotion-render',
			serveUrl: 'https://example.com',
			composition: 'Main',
			codec: 'h264',
			frameRange: [
				[0, 10],
				[20, 30],
			] as never,
		}),
	).toThrow(/Multiple frame ranges are not supported on Lambda/);
});
