import type {M3uStreamInfo, M3uStructure} from './types';

export type M3uStream = {
	url: string;
	box: M3uStreamInfo;
};

export const getStreams = (
	structure: M3uStructure,
	originalSrc: string | null,
): M3uStream[] => {
	const boxes: M3uStream[] = [];

	for (let i = 0; i < structure.boxes.length; i++) {
		const str = structure.boxes[i];
		if (str.type === 'm3u-stream-info') {
			const next = structure.boxes[i + 1];
			if (next.type !== 'm3u-text-value') {
				throw new Error('Expected m3u-text-value');
			}

			boxes.push({
				url: originalSrc ? new URL(next.value, originalSrc).href : next.value,
				box: str,
			});
		}
	}

	return boxes;
};
