import {useLayoutEffect, useRef, type RefObject} from 'react';
import type {LogLevel} from './log';
import {Log} from './log';

let warned = false;

const warnOnce = (logLevel: LogLevel) => {
	if (warned) {
		return;
	}

	warned = true;

	Log.warn(logLevel, 'AudioContext is not supported in this browser');
};

export const useAmplification = ({
	mediaRef,
	volume,
	logLevel,
}: {
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>;
	volume: number;
	logLevel: LogLevel;
}) => {
	const shouldAmplify = volume > 1;
	const gainRef = useRef<GainNode | null>(null);

	useLayoutEffect(() => {
		if (!shouldAmplify) {
			return;
		}

		if (!AudioContext) {
			warnOnce(logLevel);
			return;
		}

		if (!mediaRef.current) {
			return;
		}

		const audioContext = new AudioContext();
		const source = audioContext.createMediaElementSource(mediaRef.current);
		const gainNode = audioContext.createGain();
		gainRef.current = gainNode;
		source.connect(gainNode);
		gainNode.connect(audioContext.destination);

		return () => {
			gainNode.disconnect();
			source.disconnect();
			audioContext.close();
			gainRef.current = null;
		};
	}, [logLevel, mediaRef, shouldAmplify]);

	useLayoutEffect(() => {
		if (!gainRef.current) {
			return;
		}

		gainRef.current.gain.value = volume;
	}, [volume]);
};
