import {useContext, useLayoutEffect, useRef, type RefObject} from 'react';
import {SharedAudioContext} from './audio/shared-audio-tags';
import type {SharedElementSourceNode} from './audio/shared-element-source-node';
import {isApproximatelyTheSame} from './is-approximately-the-same';
import type {Logger} from './logger.js';
import {useLogger} from './use-logger.js';
import {isSafari} from './video/video-fragment';

type AudioItems = {
	gainNode: GainNode;
};

let warned = false;

const warnSafariOnce = (logger: Logger) => {
	if (warned) {
		return;
	}

	warned = true;
	logger.warn(
		null,
		'In Safari, setting a volume and a playback rate at the same time is buggy.',
	);
	logger.warn(null, 'In Desktop Safari, only volumes <= 1 will be applied.');
	logger.warn(
		null,
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
	source,
	shouldUseWebAudioApi,
}: {
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement | null>;
	source: SharedElementSourceNode | null;
	volume: number;
	shouldUseWebAudioApi: boolean;
}) => {
	const audioStuffRef = useRef<AudioItems | null>(null);
	const logger = useLogger();
	const currentVolumeRef = useRef(volume);
	currentVolumeRef.current = volume;

	const sharedAudioContext = useContext(SharedAudioContext);
	if (!sharedAudioContext) {
		throw new Error(
			'useAmplification must be used within a SharedAudioContext',
		);
	}

	const {audioContext, gainNode: masterGainNode} = sharedAudioContext;

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
				warnSafariOnce(logger);
				return;
			}

			if (!source) {
				return;
			}

			if (!masterGainNode) {
				return;
			}

			const gainNode = new GainNode(audioContext, {
				gain: currentVolumeRef.current,
			});

			source.attemptToConnect();
			source.get().connect(gainNode);
			gainNode.connect(masterGainNode);
			audioStuffRef.current = {
				gainNode,
			};

			logger.trace(
				null,
				`Starting to amplify ${mediaRef.current?.src}. Gain = ${currentVolumeRef.current}, playbackRate = ${mediaRef.current?.playbackRate}`,
			);

			return () => {
				audioStuffRef.current = null;
				gainNode.disconnect();
				source.get().disconnect();
			};
			// The logger has stable identity and reads the latest context.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [mediaRef, audioContext, source, shouldUseWebAudioApi, masterGainNode]);
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
			logger.trace(
				null,
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
