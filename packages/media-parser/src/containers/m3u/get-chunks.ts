import type {M3uPlaylist} from './types';

export type M3uChunk = {
	duration: number;
	url: string;
};

export const getChunks = (playlist: M3uPlaylist) => {
	const chunks: M3uChunk[] = [];
	for (let i = 0; i < playlist.boxes.length; i++) {
		const box = playlist.boxes[i];
		if (box.type === 'm3u-extinf') {
			const nextBox = playlist.boxes[i + 1];
			i++;
			if (nextBox.type !== 'm3u-text-value') {
				throw new Error('Expected m3u-text-value');
			}

			chunks.push({duration: box.value, url: nextBox.value});
		}

		continue;
	}

	return chunks;
};
