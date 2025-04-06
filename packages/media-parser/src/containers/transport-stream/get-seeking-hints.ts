import type {TransportStreamSeekingHints} from '../../seeking-hints';
import type {TracksState} from '../../state/has-tracks-section';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';

export const getSeekingInfoFromTransportStream = (
	transportStream: TransportStreamState,
	tracksState: TracksState,
): TransportStreamSeekingHints => {
	const firstVideoTrack = tracksState
		.getTracks()
		.find((t) => t.type === 'video');

	if (!firstVideoTrack) {
		throw new Error('No video track found');
	}

	return {
		type: 'transport-stream-seeking-hints',
		observedPesHeaders:
			transportStream.observedPesHeaders.getPesKeyframeHeaders(),
		ptsStartOffset: transportStream.startOffset.getOffset(
			firstVideoTrack.trackId,
		),
	};
};
