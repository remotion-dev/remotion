import type {
	MediaParserContainer,
	MediaParserTrack,
} from '@remotion/media-parser';

export const isAudioOnly = ({
	tracks,
	container,
}: {
	tracks: MediaParserTrack[] | null;
	container: MediaParserContainer | null;
}) => {
	if (container === 'mp3') {
		return true;
	}

	return (
		(tracks && tracks.filter((t) => t.type === 'video').length === 0) ?? false
	);
};
