import type {MediaParserController} from '../controller/media-parser-controller';
import type {PrefetchCache} from '../fetch';
import type {MediaParserLogLevel} from '../log';
import type {ParseMediaSrc} from '../options';
import type {MediaParserReaderInterface} from '../readers/reader';
import type {SpsAndPps} from './parser-state';
import {lazyIdx1Fetch} from './riff/lazy-idx1-fetch';
import {queuedBFramesState} from './riff/queued-frames';
import {riffSampleCounter} from './riff/sample-counter';

type AvcProfileInfoCallback = (profile: SpsAndPps) => Promise<void>;

export const riffSpecificState = ({
	controller,
	logLevel,
	readerInterface,
	src,
	prefetchCache,
	contentLength,
}: {
	controller: MediaParserController;
	logLevel: MediaParserLogLevel;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	prefetchCache: PrefetchCache;
	contentLength: number;
}) => {
	let avcProfile: SpsAndPps | null = null;
	let nextTrackIndex = 0;

	const profileCallbacks: AvcProfileInfoCallback[] = [];

	const registerOnAvcProfileCallback = (callback: AvcProfileInfoCallback) => {
		profileCallbacks.push(callback);
	};

	const onProfile = async (profile: SpsAndPps) => {
		avcProfile = profile;
		for (const callback of profileCallbacks) {
			await callback(profile);
		}

		profileCallbacks.length = 0;
	};

	const lazyIdx1 = lazyIdx1Fetch({
		controller,
		logLevel,
		readerInterface,
		src,
		prefetchCache,
		contentLength,
	});

	const sampleCounter = riffSampleCounter();
	const queuedBFrames = queuedBFramesState();

	return {
		getAvcProfile: () => {
			return avcProfile;
		},
		onProfile,
		registerOnAvcProfileCallback,
		getNextTrackIndex: () => {
			return nextTrackIndex;
		},
		queuedBFrames,
		incrementNextTrackIndex: () => {
			nextTrackIndex++;
		},
		lazyIdx1,
		sampleCounter,
	};
};

export type RiffState = ReturnType<typeof riffSpecificState>;
