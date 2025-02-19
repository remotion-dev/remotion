import {registerRoot} from 'remotion';

// Enable only when Skia v19 supports it
// import {loadSkia} from './load-skia.js';

// Should be able to defer registerRoot()
(async () => {
	//	await loadSkia();
	const {Index} = await import('./Root');
	registerRoot(Index);
})();
