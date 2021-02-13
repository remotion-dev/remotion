import {TCompMetadata} from './CompositionManager';
import {getIsEvaluation} from './register-root';

if (typeof window !== 'undefined') {
	window.ready = false;
}

let handles: number[] = [];

export const delayRender = (): number => {
	const handle = Math.random();
	if (getIsEvaluation()) {
		// Don't wait while statically determining the composition list
		return handle;
	}
	handles.push(handle);
	if (typeof window !== 'undefined') {
		window.ready = false;
	}
	return handle;
};

export const continueRender = (handle: number): void => {
	handles = handles.filter((h) => h !== handle);
	if (handles.length === 0 && typeof window !== 'undefined') {
		window.ready = true;
	}
};

declare global {
	interface Window {
		ready: boolean;
		getStaticCompositions: () => TCompMetadata[];
		remotion_setFrame: (frame: number) => void
	}
}
