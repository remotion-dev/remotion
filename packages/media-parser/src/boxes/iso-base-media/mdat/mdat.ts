import type {BufferIterator} from '../../../buffer-iterator';
import {getTracks, hasTracks} from '../../../get-tracks';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';

export interface MdatBox {
	type: 'mdat-box';
	samplesProcessed: boolean;
	boxSize: number;
}

export type AudioSample = {
	bytes: Uint8Array;
	timestamp: number;
	offset: number;
	trackId: number;
};

export type VideoSample = {
	bytes: Uint8Array;
	timestamp: number;
	duration: number;
	trackId: number;
	type: 'key' | 'delta';
	cts: number;
	dts: number;
};

export type OnAudioSample = (sample: AudioSample) => void;
export type OnVideoSample = (sample: VideoSample) => void;

// TODO: Parse mdat only gets called when all of the atom is downloaded
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
	const alreadyHas = hasTracks(existingBoxes);
	if (!alreadyHas) {
		data.discard(size - 8);
		return {
			type: 'mdat-box',
			boxSize: size,
			samplesProcessed: false,
		};
	}

	const tracks = getTracks(existingBoxes);
	const allTracks = [...tracks.videoTracks, ...tracks.audioTracks];

	const flatSamples = allTracks
		.map((track) => {
			return track.samplePositions.map((samplePosition) => {
				return {
					track,
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

		if (sampleWithIndex.track.type === 'audio' && options.onAudioSample) {
			options.onAudioSample({
				bytes,
				timestamp: sampleWithIndex.samplePosition.offset,
				offset: data.counter.getOffset(),
				trackId: sampleWithIndex.track.trackId,
			});
		}

		if (sampleWithIndex.track.type === 'video' && options.onVideoSample) {
			const timestamp =
				(sampleWithIndex.samplePosition.cts * 1_000_000) /
				sampleWithIndex.track.timescale;
			const duration =
				(sampleWithIndex.samplePosition.duration * 1_000_000) /
				sampleWithIndex.track.timescale;

			options.onVideoSample({
				bytes,
				timestamp,
				duration,
				cts: sampleWithIndex.samplePosition.cts,
				dts: sampleWithIndex.samplePosition.dts,
				trackId: sampleWithIndex.track.trackId,
				type: sampleWithIndex.samplePosition.isKeyframe ? 'key' : 'delta',
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
		samplesProcessed: true,
	};
};
