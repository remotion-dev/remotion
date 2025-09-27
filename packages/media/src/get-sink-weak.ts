import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const getSinkWeak = async (src: string, logLevel: LogLevel) => {
	let promise = sinkPromises[src];
	if (!promise) {
		promise = getSinks(src);
		sinkPromises[src] = promise;
	}

	let awaited = await promise;
	let deferredValue = awaited.deref();

	if (!deferredValue) {
		Internals.Log.verbose(
			{
				logLevel,
				tag: '@remotion/media',
			},
			`Sink for ${src} was garbage collected, creating new sink`,
		);
		promise = getSinks(src);
		sinkPromises[src] = promise;

		awaited = await promise;
		deferredValue = awaited.deref()!;
	}

	return deferredValue;
};
