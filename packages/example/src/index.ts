import {Internals, registerRoot} from 'remotion';
import {Index} from './Video';

// Should be able to defer registerRoot()
if (Internals.getRemotionEnvironment() === 'server-rendering') {
	// TODO: Give warning if using setTimeout.
	registerRoot(Index);
} else {
	setTimeout(() => {
		registerRoot(Index);
	}, 500);
}
