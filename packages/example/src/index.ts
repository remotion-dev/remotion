import {registerRoot} from 'remotion';
// @ts-expect-error load-skia
import {loadSkia} from './load-skia.js';

// Should be able to defer registerRoot()
(async () => {
	await loadSkia();
	const {RemotionRoot} = await import('./Root');
	registerRoot(RemotionRoot);
})();
