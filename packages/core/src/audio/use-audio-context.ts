import {useMemo, useRef} from 'react';
import type {LogLevel} from '../log';
import {Log} from '../log';
import {useRemotionEnvironment} from '../use-remotion-environment';

// The native AudioContext.state can be 'closed' | 'interrupted' | 'running' | 'suspended'.
// resume() and suspend() do not change the state immediately, so we expose two
// additional transition states to reflect that a change is in progress.
export type RemotionAudioContextState =
	| AudioContextState
	| 'running-to-suspended'
	| 'suspended-to-running';

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

export const useSingletonAudioContext = ({
	logLevel,
	latencyHint,
	audioEnabled,
	sampleRate,
}: {
	logLevel: LogLevel;
	latencyHint: AudioContextLatencyCategory;
	audioEnabled: boolean;
	sampleRate: number;
}) => {
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
			warnOnce(logLevel);
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
		Log.trace({logLevel, tag: 'audio'}, 'Creating new audio context');

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
	}, [logLevel, latencyHint, env.isRendering, audioEnabled, sampleRate]);

	return context;
};
