import {registerAc3Decoder} from '@mediabunny/ac3';
import {registerAc3Encoder} from '@mediabunny/ac3';
import {registerRoot} from 'remotion';

registerAc3Decoder();
registerAc3Encoder();

// Enable only when Skia v19 supports it
// import {loadSkia} from './load-skia.js';

// Should be able to defer registerRoot()
(async () => {
	//	await loadSkia();
	const {Index} = await import('./Root');
	registerRoot(Index);
})();
