import {useContext, useLayoutEffect, useRef, type RefObject} from 'react';
import {SharedAudioContext} from './audio/shared-audio-tags';
import type {SharedElementSourceNode} from './audio/shared-element-source-node';
import {isApproximatelyTheSame} from './is-approximately-the-same';
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
		{logLevel, tag: null},
		'In Safari, setting a volume and a playback rate at the same time is buggy.',
	);
	Log.warn(
		{logLevel, tag: null},
		'In Desktop Safari, only volumes <= 1 will be applied.',
	);
	Log.warn(
		{logLevel, tag: null},
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
	shouldUseWebAudioApi,
}: {
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>;
	source: SharedElementSourceNode | null;
	volume: number;
	logLevel: LogLevel;
	shouldUseWebAudioApi: boolean;
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

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (!audioContext) {
				return;
			}

			if (!mediaRef.current) {
				return;
			}

			if (!shouldUseWebAudioApi) {
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
				{logLevel, tag: null},
				`Starting to amplify ${mediaRef.current?.src}. Gain = ${currentVolumeRef.current}, playbackRate = ${mediaRef.current?.playbackRate}`,
			);

			return () => {
				audioStuffRef.current = null;
				gainNode.disconnect();
				source.get().disconnect();
			};
		}, [logLevel, mediaRef, audioContext, source, shouldUseWebAudioApi]);
	}

	if (audioStuffRef.current) {
		const valueToSet = volume;
		if (
			!isApproximatelyTheSame(
				audioStuffRef.current.gainNode.gain.value,
				valueToSet,
			)
		) {
			audioStuffRef.current.gainNode.gain.value = valueToSet;
			Log.trace(
				{logLevel, tag: null},
				`Setting gain to ${valueToSet} for ${mediaRef.current?.src}`,
			);
		}
	}

	const safariCase =
		isSafari() && mediaRef.current && mediaRef.current?.playbackRate !== 1;

	const shouldUseTraditionalVolume = safariCase || !shouldUseWebAudioApi;

	// [1]
	if (
		shouldUseTraditionalVolume &&
		mediaRef.current &&
		!isApproximatelyTheSame(volume, mediaRef.current?.volume)
	) {
		mediaRef.current.volume = Math.min(volume, 1);
	}

	return audioStuffRef;
};
