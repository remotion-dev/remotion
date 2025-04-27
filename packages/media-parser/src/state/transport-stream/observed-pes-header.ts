import {MPEG_TIMESCALE} from '../../containers/transport-stream/handle-avc-packet';
import type {PacketPes} from '../../containers/transport-stream/parse-pes';
import type {TransportStreamSeekingHints} from '../../seeking-hints';

export const makeObservedPesHeader = () => {
	const pesHeaders: PacketPes[] = [];
	const confirmedAsKeyframe: number[] = [];

	const addPesHeader = (pesHeader: PacketPes) => {
		if (pesHeaders.find((p) => p.offset === pesHeader.offset)) {
			return;
		}

		pesHeaders.push(pesHeader);
	};

	const markPtsAsKeyframe = (pts: number) => {
		confirmedAsKeyframe.push(pts);
	};

	const getPesKeyframeHeaders = () => {
		return pesHeaders.filter((p) => confirmedAsKeyframe.includes(p.pts));
	};

	const setPesKeyframesFromSeekingHints = (
		hints: TransportStreamSeekingHints,
	) => {
		for (const pesHeader of hints.observedPesHeaders) {
			addPesHeader(pesHeader);
			markPtsAsKeyframe(pesHeader.pts);
		}
	};

	const state = {
		pesHeaders,
		addPesHeader,
		markPtsAsKeyframe,
		getPesKeyframeHeaders,
		setPesKeyframesFromSeekingHints,
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
