import type {TransportStreamSeekingInfo} from '../../seeking-info';
import type {TracksState} from '../../state/has-tracks-section';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';

export const getSeekingInfoFromTransportStream = (
	transportStream: TransportStreamState,
	tracksState: TracksState,
): TransportStreamSeekingInfo => {
	const firstVideoTrack = tracksState
		.getTracks()
		.find((t) => t.type === 'video');

	if (!firstVideoTrack) {
		throw new Error('No video track found');
	}

	return {
		type: 'transport-stream-seeking-info',
		observedPesHeaders:
			transportStream.observedPesHeaders.getPesKeyframeHeaders(),
		ptsStartOffset: transportStream.startOffset.getOffset(
			firstVideoTrack.trackId,
		),
	};
};
