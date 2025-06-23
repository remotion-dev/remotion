import type {TransportStreamSeekingHints} from '../../seeking-hints';
import type {TracksState} from '../../state/has-tracks-section';
import type {ParserState} from '../../state/parser-state';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';

export const getSeekingHintsFromTransportStream = (
	transportStream: TransportStreamState,
	tracksState: TracksState,
): TransportStreamSeekingHints | null => {
	const firstVideoTrack = tracksState
		.getTracks()
		.find((t) => t.type === 'video');

	if (!firstVideoTrack) {
		return null;
	}

	return {
		type: 'transport-stream-seeking-hints',
		observedPesHeaders:
			transportStream.observedPesHeaders.getPesKeyframeHeaders(),
		ptsStartOffset: transportStream.startOffset.getOffset(
			firstVideoTrack.trackId,
		),
		firstVideoTrackId: firstVideoTrack.trackId,
	};
};

export const setSeekingHintsForTransportStream = ({
	hints,
	state,
}: {
	hints: TransportStreamSeekingHints;
	state: ParserState;
}) => {
	state.transportStream.observedPesHeaders.setPesKeyframesFromSeekingHints(
		hints,
	);
	state.transportStream.startOffset.setOffset({
		trackId: hints.firstVideoTrackId,
		newOffset: hints.ptsStartOffset,
	});
};
