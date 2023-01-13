import type {CompositorLayer} from './compositor/payloads';

export const getNativeVideoSignals = (layers: CompositorLayer[]) => {
	const videoSignals = layers
		.filter((l) => {
			return l.type === 'VideoFrame';
		})
		.map((l) => {
			if (l.type !== 'VideoFrame') {
				throw new Error('Expected VideoFrame');
			}

			return {frame: l.params.frame, src: l.params.src};
		});

	const map: Record<string, Record<number, number>> = {};

	// Return a map for each video source and the number of times each frame is expected to be used
	for (const {src, frame} of videoSignals) {
		if (!map[src]) {
			map[src] = {};
		}

		if (!map[src][frame]) {
			map[src][frame] = 0;
		}

		map[src][frame]++;
	}

	return map;
};
