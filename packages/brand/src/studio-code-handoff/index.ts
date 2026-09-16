import {registerRoot} from 'remotion';
import '../index.css';
import {StudioCodeHandoffRoot} from './Root';

if (typeof window !== 'undefined') {
	window.remotion_initialFrame = 655;
}

registerRoot(StudioCodeHandoffRoot);
