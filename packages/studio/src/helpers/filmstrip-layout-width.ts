import {SEQUENCE_BORDER_WIDTH} from './sequence-border-width';

export {SEQUENCE_BORDER_WIDTH} from './sequence-border-width';

// Filmstrip slot timing must stay proportional to media duration. Sequence
// layout subtracts SEQUENCE_BORDER_WIDTH from track width, which would otherwise
// make timestamp slots drift on every left-edge trim step.
export const getFilmstripLayoutWidth = (mediaWidth: number) => {
	if (mediaWidth <= 0) {
		return 0;
	}

	return mediaWidth + SEQUENCE_BORDER_WIDTH;
};
