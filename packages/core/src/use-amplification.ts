import {useEffect, useLayoutEffect, useRef, type RefObject} from 'react';
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

type AudioItems = {
	gainNode: GainNode;
	source: MediaElementAudioSourceNode;
	audioContext: AudioContext;
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
	const audioStuffRef = useRef<AudioItems | null>(null);

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

		if (audioStuffRef.current) {
			return;
		}

		const audioContext = new AudioContext();
		const source = audioContext.createMediaElementSource(mediaRef.current);
		const gainNode = audioContext.createGain();

		audioStuffRef.current = {
			gainNode,
			source,
			audioContext,
		};
		source.connect(gainNode);
		gainNode.connect(audioContext.destination);
	}, [logLevel, mediaRef, shouldAmplify]);

	useLayoutEffect(() => {
		if (!audioStuffRef.current) {
			return;
		}

		if (volume <= 1) {
			audioStuffRef.current.gainNode.gain.value = 1;
		}

		audioStuffRef.current.gainNode.gain.value = volume;
	}, [volume]);

	useEffect(() => {
		return () => {
			audioStuffRef.current = null;
		};
	}, []);
};
