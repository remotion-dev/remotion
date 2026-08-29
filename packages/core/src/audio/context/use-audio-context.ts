import {useMemo, useRef} from 'react';
import {useLogLevel} from '../../log-level-context';
import {useRemotionEnvironment} from '../../use-remotion-environment';
import {buildAudioContext} from './build-audio-context';

// The native AudioContext.state can be 'closed' | 'interrupted' | 'running' | 'suspended'.
// resume() and suspend() do not change the state immediately, so we expose two
// additional transition states to reflect that a change is in progress.
export type RemotionAudioContextState =
	| AudioContextState
	| 'running-to-suspended'
	| 'suspended-to-running';

export const useSingletonAudioContext = ({
	latencyHint,
	audioEnabled,
	sampleRate,
}: {
	latencyHint: AudioContextLatencyCategory;
	audioEnabled: boolean;
	sampleRate: number;
}) => {
	const logLevel = useLogLevel();
	const env = useRemotionEnvironment();
	const initialSampleRate = useRef(sampleRate);

	if (sampleRate !== initialSampleRate.current) {
		throw new Error(
			`Changing the AudioContext sample rate dynamically is not supported. The sample rate was initialized with ${initialSampleRate.current} Hz, but ${sampleRate} Hz was passed later.`,
		);
	}

	const context = useMemo(() => {
		const built = buildAudioContext({
			isRendering: env.isRendering,
			audioEnabled,
			logLevel,
			latencyHint,
			sampleRate,
		});

		if (!built) {
			return null;
		}

		const {audioContext, gainNode} = built;

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
