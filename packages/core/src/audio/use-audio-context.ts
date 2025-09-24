import {useMemo} from 'react';
import type {LogLevel} from '../log';
import {Log} from '../log';

let warned = false;

const warnOnce = (logLevel: LogLevel) => {
	if (warned) {
		return;
	}

	warned = true;

	// Don't pullute logs if in SSR
	if (typeof window !== 'undefined') {
		Log.warn(
			{logLevel, tag: null},
			'AudioContext is not supported in this browser',
		);
	}
};

export const useSingletonAudioContext = (
	logLevel: LogLevel,
	latencyHint: AudioContextLatencyCategory,
) => {
	const audioContext = useMemo(() => {
		if (typeof AudioContext === 'undefined') {
			warnOnce(logLevel);
			return null;
		}

		return new AudioContext({
			latencyHint,
		});
	}, [logLevel, latencyHint]);

	return audioContext;
};
