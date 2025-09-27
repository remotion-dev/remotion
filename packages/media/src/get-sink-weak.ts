import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const getSinkWeak = async (src: string) => {
	let promise = sinkPromises[src];
	if (!promise) {
		promise = getSinks(src);
		sinkPromises[src] = promise;
	}

	let awaited = await promise;
	let deferredValue = awaited.deref();

	if (!deferredValue) {
		promise = getSinks(src);
		sinkPromises[src] = promise;

		awaited = await promise;
		deferredValue = awaited.deref()!;
	}

	return deferredValue;
};
