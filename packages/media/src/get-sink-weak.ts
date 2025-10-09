import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const getSinkWeak = async (src: string, logLevel: LogLevel) => {
	let promise = sinkPromises[src];
	if (!promise) {
		Internals.Log.verbose(
			{
				logLevel,
				tag: '@remotion/media',
			},
			`Sink for ${src} was not found, creating new sink`,
		);
		promise = getSinks(src);
		sinkPromises[src] = promise;
	}

	return promise;
};
