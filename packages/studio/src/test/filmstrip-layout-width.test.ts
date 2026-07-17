import {expect, test} from 'bun:test';
import {
	getFilmstripLayoutWidth,
	SEQUENCE_BORDER_WIDTH,
} from '../helpers/filmstrip-layout-width';

test('filmstrip layout width restores sequence border so slot timing stays proportional', () => {
	const timelineDurationInFrames = 300;
	const fullWidth = 1000;
	const fps = 30;
	const aspectRatio = 16 / 9;
	const frameHeight = 50;

	const slotDurationForTrim = (durationInFrames: number) => {
		const mediaWidth =
			(durationInFrames / timelineDurationInFrames) * fullWidth -
			SEQUENCE_BORDER_WIDTH;
		const filmstripWidth = getFilmstripLayoutWidth(mediaWidth);
		const segmentDuration = durationInFrames / fps;
		const framesFitInWidthUnrounded =
			filmstripWidth / (frameHeight * aspectRatio);

		return segmentDuration / framesFitInWidthUnrounded;
	};

	expect(slotDurationForTrim(47)).toBeCloseTo(slotDurationForTrim(46), 12);
	expect(getFilmstripLayoutWidth(226)).toBe(226 + SEQUENCE_BORDER_WIDTH);
});
