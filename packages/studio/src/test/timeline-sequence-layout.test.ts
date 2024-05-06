import {expect, test} from 'bun:test';
import {getTimelineSequenceLayout} from '../helpers/get-timeline-sequence-layout';

test('Should test timeline sequence layout without max media duration', () => {
	expect(
		getTimelineSequenceLayout({
			durationInFrames: 400,
			startFrom: 2023,
			startFromMedia: 0,
			maxMediaDuration: null,
			video: {
				durationInFrames: 2423,
				fps: 30,
				height: 1080,
				width: 1920,
				id: 'main',
				// @ts-expect-error
				component: {
					_payload: {
						_status: 1,
					},
				},
				props: {},
				nonce: 16,
			},
			windowWidth: 1414.203125,
		}),
	).toEqual({
		marginLeft: 1154.2137986426505,
		premountWidth: null,
		width: 226.9893263573493,
	});
});
test('Should test timeline sequence layout with max media duration', () => {
	expect(
		getTimelineSequenceLayout({
			durationInFrames: 400,
			startFrom: 2023,
			maxMediaDuration: 400,
			startFromMedia: 10,
			video: {
				durationInFrames: 2423,
				fps: 30,
				height: 1080,
				width: 1920,
				id: 'main',
				// @ts-expect-error
				component: {
					_payload: {
						_status: 1,
					},
				},
				props: {},
				nonce: 16,
			},
			windowWidth: 1414.203125,
		}),
	).toEqual({
		marginLeft: 1154.2137986426505,
		premountWidth: null,
		width: 221.8531462892238,
	});
});
