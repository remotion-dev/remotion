import {MPEG_TIMESCALE} from '../../containers/transport-stream/handle-avc-packet';
import type {PacketPes} from '../../containers/transport-stream/parse-pes';

export const makeObservedPesHeader = () => {
	const pesHeaders: PacketPes[] = [];
	const confirmedAsKeyframe: number[] = [];

	const state = {
		pesHeaders,
		addPesHeader: (pesHeader: PacketPes) => {
			if (pesHeaders.find((p) => p.offset === pesHeader.offset)) {
				return;
			}

			pesHeaders.push(pesHeader);
		},
		markPtsAsKeyframe: (pts: number) => {
			confirmedAsKeyframe.push(pts);
		},
		getPesKeyframeHeaders: () => {
			return pesHeaders.filter((p) => confirmedAsKeyframe.includes(p.pts));
		},
	};

	return state;
};

export type ObservedPesHeaderState = ReturnType<typeof makeObservedPesHeader>;

export const getLastKeyFrameBeforeTimeInSeconds = ({
	observedPesHeaders,
	timeInSeconds,
	ptsStartOffset,
}: {
	observedPesHeaders: ObservedPesHeaderState['pesHeaders'];
	timeInSeconds: number;
	ptsStartOffset: number;
}) => {
	return observedPesHeaders.findLast(
		(k) => (k.pts - ptsStartOffset) / MPEG_TIMESCALE <= timeInSeconds,
	);
};
