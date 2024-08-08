import type {BufferIterator} from '../../../buffer-iterator';
import {getTracks} from '../../../get-tracks';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';

export interface MdatBox {
	type: 'mdat-box';
	boxSize: number;
}

export type AudioSample = {
	bytes: Uint8Array;
	start: number;
	offset: number;
	trackId: number;
};

export type VideoSample = {
	bytes: Uint8Array;
	start: number;
	offset: number;
	trackId: number;
};

export type OnAudioSample = (sample: AudioSample) => void;
export type OnVideoSample = (sample: VideoSample) => void;

export const parseMdat = ({
	data,
	size,
	fileOffset,
	existingBoxes,
	options,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
	existingBoxes: AnySegment[];
	options: ParserContext;
}): MdatBox => {
	// TODO: Do something cool with it
	const tracks = getTracks(existingBoxes);

	const flatSamples = tracks
		.map((track) => {
			return track.samplePositions.map((samplePosition) => {
				return {
					type: track.type,
					trackId: track.trackId,
					samplePosition,
				};
			});
		})
		.flat(1);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const sampleWithIndex = flatSamples.find((sample) => {
			return sample.samplePosition.offset === data.counter.getOffset();
		});
		if (!sampleWithIndex) {
			throw new Error('Could not find sample');
		}

		const bytes = data.getSlice(sampleWithIndex.samplePosition.size);

		if (sampleWithIndex.type === 'audio' && options.onAudioSample) {
			options.onAudioSample({
				bytes,
				start: sampleWithIndex.samplePosition.offset,
				offset: data.counter.getOffset(),
				trackId: sampleWithIndex.trackId,
			});
		}

		if (sampleWithIndex.type === 'video' && options.onVideoSample) {
			options.onVideoSample({
				bytes,
				start: sampleWithIndex.samplePosition.offset,
				offset: data.counter.getOffset(),
				trackId: sampleWithIndex.trackId,
			});
		}

		const remaining = size - (data.counter.getOffset() - fileOffset);
		if (remaining === 0) {
			break;
		}
	}

	return {
		type: 'mdat-box',
		boxSize: size,
	};
};
