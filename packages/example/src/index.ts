import {registerRoot} from 'remotion';
import {Index} from './Root';

// Should be able to defer registerRoot()
setTimeout(() => {
	registerRoot(Index);
}, 500);
