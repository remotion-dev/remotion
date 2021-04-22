import {TAsset, TCompMetadata} from './CompositionManager';

if (typeof window !== 'undefined') {
	window.ready = false;
}

let handles: number[] = [];

export const delayRender = (): number => {
	const handle = Math.random();
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
		remotion_setFrame: (frame: number) => void;
		remotion_collectAssets: () => TAsset[];
	}
}
