import {test} from 'vitest';
import {blur} from '../blur.js';
import {evolve} from '../evolve.js';
import {noise} from '../noise.js';
import {
	descriptorsToMemoizedEffects,
	renderEffectChainToBlob,
	testImage,
} from './visual-utils.js';

test('stacks repeated WebGL effects without blanking or flipping the image', async () => {
	const blob = await renderEffectChainToBlob({
		effects: descriptorsToMemoizedEffects([
			blur({radius: 12}),
			blur({radius: 12}),
			noise({amount: 0.08, seed: 1}),
		]),
	});

	await testImage({
		blob,
		testId: 'stacked-blur-blur-noise',
	});
});

test('evolve() reveals with feather', async () => {
	const blob = await renderEffectChainToBlob({
		effects: descriptorsToMemoizedEffects([
			evolve({progress: 0.55, direction: 'left', feather: 0.18}),
		]),
	});

	await testImage({
		blob,
		testId: 'evolve-left-feather',
	});
});
