import {useContext, useLayoutEffect, useRef, type RefObject} from 'react';
import {SharedAudioContext} from './audio/shared-audio-tags';
import type {SharedElementSourceNode} from './audio/shared-element-source-node';
import type {LogLevel} from './log';
import {Log} from './log';

type AudioItems = {
	gainNode: GainNode;
};

export const useVolume = ({
	mediaRef,
	volume,
	logLevel,
	source,
}: {
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>;
	source: SharedElementSourceNode | null;
	volume: number;
	logLevel: LogLevel;
}) => {
	const audioStuffRef = useRef<AudioItems | null>(null);
	const currentVolumeRef = useRef(volume);
	currentVolumeRef.current = volume;

	const sharedAudioContext = useContext(SharedAudioContext);
	if (!sharedAudioContext) {
		throw new Error(
			'useAmplification must be used within a SharedAudioContext',
		);
	}

	const {audioContext} = sharedAudioContext;

	useLayoutEffect(() => {
		if (!audioContext) {
			return;
		}

		if (!mediaRef.current) {
			return;
		}

		if (!source) {
			return;
		}

		const gainNode = new GainNode(audioContext, {
			gain: currentVolumeRef.current,
		});

		source.attemptToConnect();
		source.get().connect(gainNode);
		gainNode.connect(audioContext.destination);
		audioStuffRef.current = {
			gainNode,
		};

		Log.trace(
			logLevel,
			`Starting to amplify ${mediaRef.current?.src}. Gain = ${currentVolumeRef.current}`,
		);

		return () => {
			audioStuffRef.current = null;
			gainNode.disconnect();
			source.get().disconnect();
		};
	}, [logLevel, mediaRef, audioContext, source]);

	if (audioStuffRef.current) {
		const valueToSet = volume;
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
