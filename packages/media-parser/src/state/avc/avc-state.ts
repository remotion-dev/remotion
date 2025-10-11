import {
	macroBlocksPerFrame,
	maxMacroblockBufferSize,
} from '../../containers/avc/max-buffer-size';
import type {SpsInfo} from '../../containers/avc/parse-avc';

export const avcState = () => {
	let prevPicOrderCntLsb = 0;
	let prevPicOrderCntMsb = 0;
	let sps: SpsInfo | null = null;
	let maxFramesInBuffer: number | null = null;

	return {
		getPrevPicOrderCntLsb() {
			return prevPicOrderCntLsb;
		},
		getPrevPicOrderCntMsb() {
			return prevPicOrderCntMsb;
		},
		setPrevPicOrderCntLsb(value: number) {
			prevPicOrderCntLsb = value;
		},
		setPrevPicOrderCntMsb(value: number) {
			prevPicOrderCntMsb = value;
		},
		setSps(value: SpsInfo) {
			const macroblockBufferSize = macroBlocksPerFrame(value);
			const maxBufferSize = maxMacroblockBufferSize(value);
			const maxFrames = Math.min(
				16,
				Math.floor(maxBufferSize / macroblockBufferSize),
			);
			maxFramesInBuffer = maxFrames;
			sps = value;
		},
		getSps() {
			return sps;
		},
		getMaxFramesInBuffer() {
			return maxFramesInBuffer;
		},
		clear() {
			maxFramesInBuffer = null;
			sps = null;
			prevPicOrderCntLsb = 0;
			prevPicOrderCntMsb = 0;
		},
	};
};

export type AvcState = ReturnType<typeof avcState>;
