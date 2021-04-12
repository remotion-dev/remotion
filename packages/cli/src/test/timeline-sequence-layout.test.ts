import {getTimelineSequenceLayout} from '../editor/helpers/get-timeline-sequence-layout';

test('Should test timeline sequence layout', () => {
	expect(
		getTimelineSequenceLayout({
			durationInFrames: 400,
			startFrom: 2023,
			maxMediaDuration: null,
			video: {
				durationInFrames: 2423,
				fps: 30,
				height: 1080,
				width: 1920,
				id: 'main',
				component: {
					// @ts-expect-error
					_payload: {
						_status: 1,
					},
				},
				props: {},
				nonce: 16,
			},
			windowWidth: 1414.203125,
		})
	).toEqual({
		marginLeft: 1154,
		width: 227,
	});
});
