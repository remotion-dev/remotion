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

type AudioItems = {
	gainNode: GainNode;
	source: MediaElementAudioSourceNode;
	audioContext: AudioContext;
};

export const getShouldAmplify = (volume: number) => {
	return volume > 1;
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
	const shouldAmplify = getShouldAmplify(volume);
	const audioStuffRef = useRef<AudioItems | null>(null);
	const currentVolumeRef = useRef(volume);
	currentVolumeRef.current = volume;

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

		const audioContext = new AudioContext({
			latencyHint: 'interactive',
		});

		const source = new MediaElementAudioSourceNode(audioContext, {
			mediaElement: mediaRef.current,
		});

		const gainNode = new GainNode(audioContext, {
			gain: Math.max(currentVolumeRef.current, 1),
		});

		audioStuffRef.current = {
			gainNode,
			source,
			audioContext,
		};

		source.connect(gainNode);
		gainNode.connect(audioContext.destination);
		Log.trace(
			logLevel,
			`Starting to amplify ${mediaRef.current?.src}. Gain = ${currentVolumeRef.current}`,
		);
	}, [logLevel, mediaRef, shouldAmplify]);

	if (audioStuffRef.current) {
		const valueToSet = Math.max(volume, 1);
		if (audioStuffRef.current.gainNode.gain.value !== valueToSet) {
			audioStuffRef.current.gainNode.gain.value = valueToSet;
			Log.trace(
				logLevel,
				`Setting gain to ${valueToSet} for ${mediaRef.current?.src}`,
			);
		}
	}

	return audioStuffRef;
};
