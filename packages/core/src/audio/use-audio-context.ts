import {useEffect, useMemo} from 'react';
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
		Log.warn(logLevel, 'AudioContext is not supported in this browser');
	}
};

export const useSingletonAudioContext = (logLevel: LogLevel) => {
	const audioContext = useMemo(() => {
		if (typeof AudioContext === 'undefined') {
			warnOnce(logLevel);
			return null;
		}

		return new AudioContext({
			latencyHint: 'interactive',
		});
	}, [logLevel]);

	useEffect(() => {
		return () => {
			if (audioContext) {
				audioContext.close();
			}
		};
	}, [audioContext]);

	return audioContext;
};
