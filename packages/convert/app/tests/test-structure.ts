import {
	AudioOperation,
	canCopyAudioTrack,
	canReencodeAudioTrack,
	ConvertMediaOnAudioTrackHandler,
	ConvertMediaOnProgress,
	ConvertMediaProgress,
	getDefaultAudioCodec,
} from '@remotion/webcodecs';
import React from 'react';

export type TestState =
	| {
			type: 'not-run';
	  }
	| {
			type: 'running';
			state: ConvertMediaProgress | null;
	  }
	| {
			type: 'failed';
			error: Error;
	  }
	| {
			type: 'succeeded';
			timeInMilliseconds: number;
	  };

type TestUpdater = (up: TestState) => void;

export const makeProgressReporter = (
	testUpdater: TestUpdater,
): ConvertMediaOnProgress => {
	return (progress) => {
		testUpdater({
			type: 'running',
			state: progress,
		});
	};
};

export type TestStructure = {
	name: string;
	execute: (onUpdate: (up: TestState) => void) => Promise<void>;
	run: () => Promise<void>;
	watchState: (cb: (state: TestState) => void) => void;
	src: string;
};

export const addTestWatcher = (
	test: Omit<TestStructure, 'watchState' | 'run'>,
): TestStructure => {
	const watchers = new Set<(state: TestState) => void>();

	return {
		...test,
		watchState: (cb) => {
			watchers.add(cb);
		},
		async run() {
			try {
				const startTime = Date.now();
				for (const watcher of watchers) {
					watcher({type: 'running', state: null});
				}

				await test.execute((stateUpdate) => {
					for (const watcher of watchers) {
						watcher(stateUpdate);
					}
				});
				for (const watcher of watchers) {
					watcher({
						type: 'succeeded',
						timeInMilliseconds: Date.now() - startTime,
					});
				}
			} catch (e) {
				for (const watcher of watchers) {
					watcher({type: 'failed', error: e as Error});
				}
			}
		},
	};
};

export const useTest = (test: TestStructure) => {
	const [state, setState] = React.useState<TestState>({type: 'not-run'});

	React.useEffect(() => {
		test.watchState((up) => {
			setState(up);
		});
	}, [test]);

	const run = React.useCallback(async () => {
		await test.run();
	}, [test]);

	return {state, run};
};

const DEFAULT_BITRATE = 128_000;

export const isSafari = () => {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const allowSafariAudioDrop: ConvertMediaOnAudioTrackHandler = async ({
	track,
	defaultAudioCodec,
	container,
}): Promise<AudioOperation> => {
	const bitrate = DEFAULT_BITRATE;

	const canCopy = canCopyAudioTrack({
		inputCodec: track.codecWithoutConfig,
		container,
	});

	if (canCopy) {
		return Promise.resolve({type: 'copy'});
	}

	const audioCodec = defaultAudioCodec ?? getDefaultAudioCodec({container});
	const canReencode = await canReencodeAudioTrack({
		audioCodec,
		track,
		bitrate,
	});

	if (canReencode) {
		return Promise.resolve({
			type: 'reencode',
			bitrate,
			audioCodec,
		});
	}

	if (isSafari()) {
		return Promise.resolve({type: 'drop'});
	}
	return Promise.resolve({type: 'fail'});
};
