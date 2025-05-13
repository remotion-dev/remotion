import {useContext, useLayoutEffect, useRef, type RefObject} from 'react';
import {SharedAudioContext} from './audio/shared-audio-tags';
import type {SharedElementSourceNode} from './audio/shared-element-source-node';
import type {LogLevel} from './log';
import {Log} from './log';
import {isSafari} from './video/video-fragment';

type AudioItems = {
	gainNode: GainNode;
};

let warned = false;

const warnSafariOnce = (logLevel: LogLevel) => {
	if (warned) {
		return;
	}

	warned = true;
	Log.warn(
		logLevel,
		'In Safari, setting a volume and a playback rate at the same time is buggy.',
	);
	Log.warn(logLevel, 'In Desktop Safari, only volumes <= 1 will be applied.');
	Log.warn(
		logLevel,
		'In Mobile Safari, the volume will be ignored and set to 1 if a playbackRate is set.',
	);
};

/**
 * [1] Bug case: In Safari, you cannot combine playbackRate and volume !== 1.
 * If that is the case, volume will not be applied.
 */

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

		// [1]
		if (mediaRef.current.playbackRate !== 1 && isSafari()) {
			warnSafariOnce(logLevel);
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
			`Starting to amplify ${mediaRef.current?.src}. Gain = ${currentVolumeRef.current}, playbackRate = ${mediaRef.current?.playbackRate}`,
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

	// [1]
	if (
		mediaRef.current &&
		isSafari() &&
		mediaRef.current?.playbackRate !== 1 &&
		volume !== mediaRef.current?.volume
	) {
		mediaRef.current.volume = Math.min(volume, 1);
	}

	return audioStuffRef;
};
