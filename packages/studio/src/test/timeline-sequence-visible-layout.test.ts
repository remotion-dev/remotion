import {expect, test} from 'bun:test';
import {getTimelineSequenceVisibleLayout} from '../components/Timeline/get-timeline-sequence-visible-layout';

test('clips a very wide sequence to the render window', () => {
	const layout = getTimelineSequenceVisibleLayout({
		marginLeft: 100,
		width: 10_000,
		premountWidth: 50,
		postmountWidth: 75,
		renderWindowLeft: 1_000,
		renderWindowWidth: 600,
	});

	expect(layout).toEqual({
		marginLeft: 1_000,
		width: 600,
		cropLeft: 900,
		leftEdgeVisible: false,
		rightEdgeVisible: false,
		premount: null,
		postmount: null,
		media: {
			left: 0,
			width: 600,
			offset: 850,
			fullWidth: 9_875,
		},
	});
});

test('preserves the real item edges and mount regions when visible', () => {
	const layout = getTimelineSequenceVisibleLayout({
		marginLeft: 100,
		width: 500,
		premountWidth: 50,
		postmountWidth: 75,
		renderWindowLeft: 0,
		renderWindowWidth: 1_000,
	});

	expect(layout).toEqual({
		marginLeft: 100,
		width: 500,
		cropLeft: 0,
		leftEdgeVisible: true,
		rightEdgeVisible: true,
		premount: {left: 0, width: 50},
		postmount: {left: 425, width: 75},
		media: {
			left: 50,
			width: 375,
			offset: 0,
			fullWidth: 375,
		},
	});
});

test('preserves a real edge when floating-point subtraction changes the width', () => {
	const marginLeft = 3.256666666666667;
	const width = 5.513333333333334;

	// Recomputing the width from the endpoints loses a fraction here.
	expect(marginLeft + width - marginLeft).not.toBe(width);

	const layout = getTimelineSequenceVisibleLayout({
		marginLeft,
		width,
		premountWidth: 0,
		postmountWidth: 0,
		renderWindowLeft: 0,
		renderWindowWidth: 100,
	});

	expect(layout?.leftEdgeVisible).toBe(true);
	expect(layout?.rightEdgeVisible).toBe(true);
});

test('does not render a sequence outside the render window', () => {
	expect(
		getTimelineSequenceVisibleLayout({
			marginLeft: 2_000,
			width: 500,
			premountWidth: 0,
			postmountWidth: 0,
			renderWindowLeft: 0,
			renderWindowWidth: 1_000,
		}),
	).toBeNull();
});
