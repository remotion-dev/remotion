import {BufferingIndicator} from './BufferingIndicator.js';
import {PauseIcon, PlayIcon} from './icons.js';

export const DefaultPlayPauseButton: React.FC<{
	playing: boolean;
	buffering: boolean;
}> = ({playing, buffering}) => {
	if (playing && buffering) {
		return <BufferingIndicator type="player" />;
	}

	if (playing) {
		return <PauseIcon />;
	}

	return <PlayIcon />;
};
