import {expect, test} from 'bun:test';
import {
	getFrameFromX,
	getFrameIncrementFromWidth,
	getScrollLeftToKeepCursorInPlace,
} from '../components/Timeline/timeline-scroll-logic';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';

test('getFrameFromX handles collapsed timeline widths', () => {
	expect(
		getFrameFromX({
			clientX: 0,
			durationInFrames: 100,
			extrapolate: 'clamp',
			width: 0,
		}),
	).toBe(0);
});

test('getFrameIncrementFromWidth never returns a negative increment', () => {
	expect(getFrameIncrementFromWidth(100, 0)).toBe(0.01);
});

test('keeps the same timeline position under the cursor after zooming', () => {
	const oldTimelineWidth = 1000;
	const newTimelineWidth = 2000;
	const oldScrollLeft = 100;
	const anchorContentX = 700;
	const cursorX = anchorContentX - oldScrollLeft;
	const oldUsableWidth = oldTimelineWidth - TIMELINE_PADDING * 2;
	const newUsableWidth = newTimelineWidth - TIMELINE_PADDING * 2;
	const oldTimelinePosition =
		(anchorContentX - TIMELINE_PADDING) / oldUsableWidth;

	const newScrollLeft = getScrollLeftToKeepCursorInPlace({
		anchorContentX,
		oldScrollLeft,
		oldTimelineWidth,
		newTimelineWidth,
	});
	const newAnchorContentX = newScrollLeft + cursorX;
	const newTimelinePosition =
		(newAnchorContentX - TIMELINE_PADDING) / newUsableWidth;

	expect(newTimelinePosition).toBeCloseTo(oldTimelinePosition, 10);
});

test('accounts for the timeline Flexer when preserving the cursor', () => {
	const fullTimelineWidth = 1200;
	const flexValues = [0.15, 0.2, 0.5];

	for (const flexValue of flexValues) {
		const scrollableWidth = fullTimelineWidth * (1 - flexValue);
		const oldTimelineWidth = scrollableWidth;
		const newTimelineWidth = scrollableWidth * 2;
		const anchorContentX = oldTimelineWidth * 0.75;
		const newScrollLeft = getScrollLeftToKeepCursorInPlace({
			anchorContentX,
			oldScrollLeft: 0,
			oldTimelineWidth,
			newTimelineWidth,
		});
		const cursorX = anchorContentX;
		const oldTimelinePosition =
			(anchorContentX - TIMELINE_PADDING) /
			(oldTimelineWidth - TIMELINE_PADDING * 2);
		const newTimelinePosition =
			(newScrollLeft + cursorX - TIMELINE_PADDING) /
			(newTimelineWidth - TIMELINE_PADDING * 2);

		expect(newTimelinePosition).toBeCloseTo(oldTimelinePosition, 10);
	}
});

test('does not drift after zooming in and back out', () => {
	const initialTimelineWidth = 1000;
	const zoomedTimelineWidth = 2500;
	const cursorX = 750;
	const zoomedScrollLeft = getScrollLeftToKeepCursorInPlace({
		anchorContentX: cursorX,
		oldScrollLeft: 0,
		oldTimelineWidth: initialTimelineWidth,
		newTimelineWidth: zoomedTimelineWidth,
	});
	const restoredScrollLeft = getScrollLeftToKeepCursorInPlace({
		anchorContentX: zoomedScrollLeft + cursorX,
		oldScrollLeft: zoomedScrollLeft,
		oldTimelineWidth: zoomedTimelineWidth,
		newTimelineWidth: initialTimelineWidth,
	});

	expect(restoredScrollLeft).toBeCloseTo(0, 10);
});

test('the last frame contributes one frame width to the timeline', () => {
	const durationInFrames = 100;
	const oldTimelineWidth = 1000;
	const newTimelineWidth = 2000;
	const oldFrameIncrement = getFrameIncrementFromWidth(
		durationInFrames,
		oldTimelineWidth,
	);
	const newFrameIncrement = getFrameIncrementFromWidth(
		durationInFrames,
		newTimelineWidth,
	);
	const oldLastFrameX =
		TIMELINE_PADDING + oldFrameIncrement * (durationInFrames - 1);
	const newLastFrameX =
		TIMELINE_PADDING + newFrameIncrement * (durationInFrames - 1);
	const newScrollLeft = getScrollLeftToKeepCursorInPlace({
		anchorContentX: oldLastFrameX,
		oldScrollLeft: 0,
		oldTimelineWidth,
		newTimelineWidth,
	});

	expect(newScrollLeft + oldLastFrameX).toBeCloseTo(newLastFrameX, 10);
	expect(newTimelineWidth - TIMELINE_PADDING - newLastFrameX).toBeCloseTo(
		newFrameIncrement,
		10,
	);
});
