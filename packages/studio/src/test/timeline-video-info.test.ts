import {expect, test} from 'bun:test';
import {getTimelineVideoInfoWidths} from '../components/Timeline/get-timeline-video-info-widths';

test('video timeline thumbnails ignore premount and postmount width', () => {
	const withoutPremount = getTimelineVideoInfoWidths({
		visualizationWidth: 400,
		naturalWidth: 500,
		premountWidth: 0,
		postmountWidth: 20,
	});
	const withPremount = getTimelineVideoInfoWidths({
		visualizationWidth: 510,
		naturalWidth: 610,
		premountWidth: 110,
		postmountWidth: 20,
	});

	expect(withPremount).toEqual(withoutPremount);
});

test('video timeline thumbnail widths never go negative', () => {
	expect(
		getTimelineVideoInfoWidths({
			visualizationWidth: 100,
			naturalWidth: 80,
			premountWidth: 70,
			postmountWidth: 70,
		}),
	).toEqual({
		mediaVisualizationWidth: 0,
		mediaNaturalWidth: 0,
	});
});
