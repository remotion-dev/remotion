import type {InputAudioTrack} from 'mediabunny';

const trackIds = new WeakMap<InputAudioTrack, number>();
let nextTrackId = 0;

export const getWaveformCacheKey = (
	src: string | InputAudioTrack,
	waveformSampleRate: number,
) => {
	if (typeof src === 'string') {
		return `${waveformSampleRate}:url:${src}`;
	}

	let id = trackIds.get(src);
	if (id === undefined) {
		id = nextTrackId++;
		trackIds.set(src, id);
	}

	return `${waveformSampleRate}:track:${id}`;
};
