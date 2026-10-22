import {expect, test} from 'bun:test';
import {
	parseRemotionMetadata,
	renderMetadataLabel,
	renderMetadataValue,
} from '../app/lib/render-metadata-label';

test('recognizes Remotion metadata comments', () => {
	expect(parseRemotionMetadata('artist', 'Made with Remotion 4.0.522')).toBe(
		null,
	);
	expect(parseRemotionMetadata('comment', 'A regular comment')).toBe(null);
	expect(
		parseRemotionMetadata(
			'comment',
			'Made with Remotion 4.0.522; A custom comment',
		),
	).toEqual({label: 'Made with Remotion', version: '4.0.522'});
	expect(
		parseRemotionMetadata(
			'comment',
			'Separated with @remotion/video-matting 4.0.523',
		),
	).toEqual({
		label: 'Separated with @remotion/video-matting',
		version: '4.0.523',
	});
	expect(
		renderMetadataLabel(
			'comment',
			'Separated with @remotion/video-matting 4.0.523',
		),
	).toBe('Separated with @remotion/video-matting');
	expect(
		renderMetadataValue({
			key: 'comment',
			value: 'Separated with @remotion/video-matting 4.0.523',
		}),
	).toBe('v4.0.523');
});
