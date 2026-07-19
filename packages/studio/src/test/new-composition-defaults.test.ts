import {expect, test} from 'bun:test';
import {getNewCompositionDefaults} from '../components/NewComposition/get-new-composition-defaults';

test('uses the selected composition dimensions as defaults', () => {
	expect(
		getNewCompositionDefaults({
			width: 1080,
			height: 1920,
			fps: 60,
			durationInFrames: 600,
		}),
	).toEqual({
		width: 1080,
		height: 1920,
		fps: 60,
		durationInFrames: 600,
	});
});

test('uses the existing defaults if no composition is selected', () => {
	expect(getNewCompositionDefaults(null)).toEqual({
		width: 1920,
		height: 1080,
		fps: 30,
		durationInFrames: 150,
	});
});
