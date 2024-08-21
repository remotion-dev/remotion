/* eslint-disable max-depth */
import type {BufferIterator} from '../../../buffer-iterator';
import {getTracks, hasTracks} from '../../../get-tracks';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';

export interface MdatBox {
	type: 'mdat-box';
	samplesProcessed: boolean;
	boxSize: number;
	fileOffset: number;
}

export const parseMdat = async ({
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
}): Promise<MdatBox> => {
	const alreadyHas = hasTracks(existingBoxes);
	if (!alreadyHas) {
		data.discard(size - (data.counter.getOffset() - fileOffset));
		return Promise.resolve({
			type: 'mdat-box',
			boxSize: size,
			samplesProcessed: false,
			fileOffset,
		});
	}

	const tracks = getTracks(existingBoxes, options.parserState);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	const flatSamples = allTracks
		.map((track) => {
			if (!track.samplePositions) {
				throw new Error('No sample positions');
			}

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
			// There are various reasons why in mdat we find weird stuff:
			// - iphonevideo.hevc has a fake hoov atom which is not mapped
			// - corrupted.mp4 has a corrupt table
			const nextSample_ = flatSamples
				.filter((s) => s.samplePosition.offset > data.counter.getOffset())
				.sort((a, b) => a.samplePosition.offset - b.samplePosition.offset)[0];
			if (nextSample_) {
				data.discard(
					nextSample_.samplePosition.offset - data.counter.getOffset(),
				);
				continue;
			} else {
				const bytesRemaining = size + fileOffset - data.counter.getOffset();
				data.discard(bytesRemaining);
				break;
			}
		}

		if (data.bytesRemaining() < sampleWithIndex.samplePosition.size) {
			break;
		}

		const bytes = data.getSlice(sampleWithIndex.samplePosition.size);

		if (sampleWithIndex.track.type === 'audio') {
			await options.parserState.onAudioSample(sampleWithIndex.track.trackId, {
				data: bytes,
				timestamp: sampleWithIndex.samplePosition.offset,
				trackId: sampleWithIndex.track.trackId,
				type: sampleWithIndex.samplePosition.isKeyframe ? 'key' : 'delta',
			});
		}

		if (sampleWithIndex.track.type === 'video') {
			const timestamp =
				(sampleWithIndex.samplePosition.cts * 1_000_000) /
				sampleWithIndex.track.timescale;
			const duration =
				(sampleWithIndex.samplePosition.duration * 1_000_000) /
				sampleWithIndex.track.timescale;

			await options.parserState.onVideoSample(sampleWithIndex.track.trackId, {
				data: bytes,
				timestamp,
				duration,
				cts: sampleWithIndex.samplePosition.cts,
				dts: sampleWithIndex.samplePosition.dts,
				trackId: sampleWithIndex.track.trackId,
				type: sampleWithIndex.samplePosition.isKeyframe ? 'key' : 'delta',
			});
		}

		const remaining = size - (data.counter.getOffset() - fileOffset);
		data.removeBytesRead();
		if (remaining === 0) {
			break;
		}
	}

	return Promise.resolve({
		type: 'mdat-box',
		boxSize: size,
		samplesProcessed: true,
		fileOffset,
	});
};
