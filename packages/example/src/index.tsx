import {registerRoot} from 'remotion';
import {Index} from './Video';

// Should be able to defer registerRoot()
setTimeout(() => {
	registerRoot(Index);
}, 500);
