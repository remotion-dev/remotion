import {expect, test} from 'bun:test';
import {getTimelineRenderWindow} from '../components/Timeline/TimelineViewport';

const getRenderWindow = (scrollLeft: number) => {
	return getTimelineRenderWindow({
		clientWidth: 100,
		scrollLeft,
	} as HTMLDivElement);
};

test('advances the render window half a viewport before its right edge', () => {
	expect(getRenderWindow(0)).toEqual({left: 0, width: 300});
	expect(getRenderWindow(149.999)).toEqual({left: 0, width: 300});
	expect(getRenderWindow(150)).toEqual({left: 100, width: 300});
	expect(getRenderWindow(249.999)).toEqual({left: 100, width: 300});
	expect(getRenderWindow(250)).toEqual({left: 200, width: 300});

	const beforeBoundary = getRenderWindow(249.999);
	const renderedAhead =
		beforeBoundary.left + beforeBoundary.width - (249.999 + 100);
	expect(renderedAhead).toBeGreaterThanOrEqual(50);
});
