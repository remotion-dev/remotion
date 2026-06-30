import {BufferingIndicator} from './BufferingIndicator.js';
import {PauseIcon, PlayIcon} from './icons.js';

export const DefaultPlayPauseButton: React.FC<{
	playing: boolean;
	buffering: boolean;
	focused: boolean;
}> = ({playing, buffering, focused}) => {
	if (playing && buffering) {
		return <BufferingIndicator type="player" />;
	}

	if (playing) {
		return <PauseIcon focused={focused} />;
	}

	return <PlayIcon focused={focused} />;
};
