import {setSeekingHintsForFlac} from './containers/flac/seeking-hints';
import {setSeekingHintsForMp4} from './containers/iso-base-media/seeking-hints';
import {setSeekingHintsForTransportStream} from './containers/transport-stream/seeking-hints';
import {setSeekingHintsForWav} from './containers/wav/seeking-hints';
import {setSeekingHintsForWebm} from './containers/webm/seek/seeking-hints';
import type {SeekingHints} from './seeking-hints';
import type {ParserState} from './state/parser-state';

export const setSeekingHints = ({
	hints,
	state,
}: {
	hints: SeekingHints;
	state: ParserState;
}) => {
	if (hints.type === 'iso-base-media-seeking-hints') {
		setSeekingHintsForMp4({hints, state});
		return;
	}

	if (hints.type === 'wav-seeking-hints') {
		setSeekingHintsForWav({hints, state});
		return;
	}

	if (hints.type === 'transport-stream-seeking-hints') {
		setSeekingHintsForTransportStream({hints, state});
		return;
	}

	if (hints.type === 'webm-seeking-hints') {
		setSeekingHintsForWebm({hints, state});
		return;
	}

	if (hints.type === 'flac-seeking-hints') {
		setSeekingHintsForFlac({hints, state});
		return;
	}

	throw new Error(`Unknown seeking hints type: ${hints satisfies never}`);
};
