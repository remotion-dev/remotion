import {useMemo, useRef} from 'react';
import type {Logger} from '../logger.js';
import {useLogger} from '../use-logger.js';
import {useRemotionEnvironment} from '../use-remotion-environment';

// The native AudioContext.state can be 'closed' | 'interrupted' | 'running' | 'suspended'.
// resume() and suspend() do not change the state immediately, so we expose two
// additional transition states to reflect that a change is in progress.
export type RemotionAudioContextState =
	| AudioContextState
	| 'running-to-suspended'
	| 'suspended-to-running';

let warned = false;

const warnOnce = (logger: Logger) => {
	if (warned) {
		return;
	}

	warned = true;

	// Don't pullute logs if in SSR
	if (typeof window !== 'undefined') {
		logger.warn(null, 'AudioContext is not supported in this browser');
	}
};

export const useSingletonAudioContext = ({
	latencyHint,
	audioEnabled,
	sampleRate,
}: {
	latencyHint: AudioContextLatencyCategory;
	audioEnabled: boolean;
	sampleRate: number;
}) => {
	const logger = useLogger();
	const env = useRemotionEnvironment();
	const initialSampleRate = useRef(sampleRate);

	if (sampleRate !== initialSampleRate.current) {
		throw new Error(
			`Changing the AudioContext sample rate dynamically is not supported. The sample rate was initialized with ${initialSampleRate.current} Hz, but ${sampleRate} Hz was passed later.`,
		);
	}

	const context = useMemo(() => {
		if (env.isRendering) {
			return null;
		}

		if (!audioEnabled) {
			return null;
		}

		if (typeof AudioContext === 'undefined') {
			warnOnce(logger);
			return null;
		}

		const audioContext = new AudioContext({
			latencyHint,
			// By default, this can end up being 44100Hz.
			// Playing a 48000Hz file in a 44100Hz context, such as https://remotion.media/video.mp4 in a @remotion/media tag
			// we observe some issues that seem to go away when we set the sample rate to 48000 with Sony LinkBuds Bluetooth headphones.
			sampleRate,
		});

		const gainNode = audioContext.createGain();
		gainNode.connect(audioContext.destination);
		logger.trace('audio', 'Creating new audio context');

		audioContext.suspend();

		// Tracks the state we are transitioning towards while resume()/suspend()
		// have been called but the native state has not updated yet.
		let transitionTarget: 'running' | 'suspended' | null = null;

		const getState = (): RemotionAudioContextState => {
			const nativeState = audioContext.state;

			if (transitionTarget === 'running' && nativeState !== 'running') {
				return 'suspended-to-running';
			}

			if (transitionTarget === 'suspended' && nativeState !== 'suspended') {
				return 'running-to-suspended';
			}

			return nativeState;
		};

		const resume = () => {
			transitionTarget = 'running';
			const promise = audioContext.resume();

			promise.finally(() => {
				if (transitionTarget === 'running') {
					transitionTarget = null;
				}
			});

			return promise;
		};

		const suspend = () => {
			transitionTarget = 'suspended';
			const promise = audioContext.suspend();

			promise.finally(() => {
				if (transitionTarget === 'suspended') {
					transitionTarget = null;
				}
			});

			return promise;
		};

		return {
			audioContext,
			gainNode,
			getState,
			resume,
			suspend,
		};
		// The logger has stable identity and reads the latest context.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [latencyHint, env.isRendering, audioEnabled, sampleRate]);

	return context;
};
