import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

const getSinkKey = (
	src: string,
	crossOrigin?: '' | 'anonymous' | 'use-credentials',
) => {
	return JSON.stringify({src, crossOrigin: crossOrigin ?? null});
};

export const getSink = ({
	src,
	logLevel,
	crossOrigin,
}: {
	src: string;
	logLevel: LogLevel;
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
}) => {
	const key = getSinkKey(src, crossOrigin);
	let promise = sinkPromises[key];
	if (!promise) {
		Internals.Log.verbose(
			{
				logLevel,
				tag: '@remotion/media',
			},
			`Sink for ${src} was not found, creating new sink`,
		);
		promise = getSinks(src, crossOrigin);
		sinkPromises[key] = promise;
	}

	return promise;
};
