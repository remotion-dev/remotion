import {continueRender, delayRender, registerRoot} from 'remotion';
import {Index} from './Video';

// Should be able to defer registerRoot()
const waitForRoot = delayRender('Waiting for root');
setTimeout(() => {
	registerRoot(Index);
	continueRender(waitForRoot);
}, 500);
