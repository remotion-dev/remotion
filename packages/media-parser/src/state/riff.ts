import type {MediaParserController} from '../controller/media-parser-controller';
import type {PrefetchCache} from '../fetch';
import type {LogLevel} from '../log';
import type {ParseMediaSrc} from '../options';
import type {ReaderInterface} from '../readers/reader';
import type {SpsAndPps} from './parser-state';
import {lazyIdx1Fetch} from './riff/lazy-idx1-fetch';
import {riffSampleCounter} from './riff/sample-counter';

type AvcProfileInfoCallback = (profile: SpsAndPps) => Promise<void>;

export const riffSpecificState = ({
	controller,
	logLevel,
	readerInterface,
	src,
	prefetchCache,
}: {
	controller: MediaParserController;
	logLevel: LogLevel;
	readerInterface: ReaderInterface;
	src: ParseMediaSrc;
	prefetchCache: PrefetchCache;
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
	});

	const sampleCounter = riffSampleCounter();

	return {
		getAvcProfile: () => {
			return avcProfile;
		},
		onProfile,
		registerOnAvcProfileCallback,
		getNextTrackIndex: () => {
			return nextTrackIndex;
		},
		incrementNextTrackIndex: () => {
			nextTrackIndex++;
		},
		lazyIdx1,
		sampleCounter,
	};
};

export type RiffState = ReturnType<typeof riffSpecificState>;
