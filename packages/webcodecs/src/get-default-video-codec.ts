import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export const getDefaultVideoCodec = ({
	container,
}: {
	container: ConvertMediaContainer;
}): ConvertMediaVideoCodec | null => {
	if (container === 'webm') {
		return 'vp8';
	}

	if (container === 'mp4') {
		return 'h264';
	}

	if (container === 'wav') {
		return null;
	}

	if (container === 'mp3') {
		return null; // MP3 doesn't support video
	}

	throw new Error(`Unhandled container: ${container satisfies never}`);
};
