import {expect, test} from 'bun:test';
import {renderMediaOnCloudrun} from '../api/render-media-on-cloudrun';

test('rejects multiple frame ranges before invoking Cloud Run', () => {
	expect(() =>
		renderMediaOnCloudrun({
			region: 'us-east1',
			serviceName: 'remotion-render',
			serveUrl: 'https://example.com',
			composition: 'Main',
			codec: 'h264',
			frameRange: [
				[0, 10],
				[20, 30],
			] as never,
		}),
	).toThrow(/Multiple frame ranges are not supported on Cloud Run/);
});
