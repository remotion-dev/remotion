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

export const useSingletonAudioContext = ({
	logLevel,
	latencyHint,
	audioEnabled,
}: {
	logLevel: LogLevel;
	latencyHint: AudioContextLatencyCategory;
	audioEnabled: boolean;
}) => {
	const env = useRemotionEnvironment();

	const audioContext = useMemo(() => {
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

		return new AudioContext({
			latencyHint,
			// By default, this can end up being 44100Hz.
			// Playing a 48000Hz file in a 44100Hz context, such as https://remotion.media/video.mp4 in a @remotion/media tag
			// we observe some issues that seem to go away when we set the sample rate to 48000 with Sony LinkBuds Bluetooth headphones.
			sampleRate: 48000,
		});
	}, [logLevel, latencyHint, env.isRendering, audioEnabled]);

	return audioContext;
};
