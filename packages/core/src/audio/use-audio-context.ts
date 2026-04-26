import {useMemo} from 'react';
import type {LogLevel} from '../log';
import {Log} from '../log';
import {useRemotionEnvironment} from '../use-remotion-environment';

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

export type SingletonAudioContext = {
	audioContext: AudioContext;
	// Master gain node sitting between all sources and `audioContext.destination`.
	// Used to ramp output up/down on resume() so we don't get a click/pop.
	// See https://github.com/remotion-dev/remotion/issues/7140.
	masterGain: GainNode;
};

export const useSingletonAudioContext = ({
	logLevel,
	latencyHint,
	audioEnabled,
}: {
	logLevel: LogLevel;
	latencyHint: AudioContextLatencyCategory;
	audioEnabled: boolean;
}): SingletonAudioContext | null => {
	const env = useRemotionEnvironment();

	const singleton = useMemo<SingletonAudioContext | null>(() => {
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
			sampleRate: 48000,
		});
		const masterGain = audioContext.createGain();
		masterGain.connect(audioContext.destination);
		return {audioContext, masterGain};
	}, [logLevel, latencyHint, env.isRendering, audioEnabled]);

	return singleton;
};
