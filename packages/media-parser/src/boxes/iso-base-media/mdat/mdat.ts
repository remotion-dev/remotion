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
			fileOffset,
		};
	}

	const tracks = getTracks(existingBoxes);
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
			if (data.bytesRemaining() >= 8) {
				const possibleAtomLength = data.getFourByteNumber();
				const possibleAtom = data.getByteString(4);
				data.counter.decrement(8);
				// if a weird hoov atom appears, like in iphonevideo.hevc
				// then we skip to the next sample
				if (possibleAtom === 'hoov' || possibleAtom === 'moof') {
					const nextSample = flatSamples
						.filter((s) => s.samplePosition.offset > data.counter.getOffset())
						.sort(
							(a, b) => a.samplePosition.offset - b.samplePosition.offset,
						)[0];
					if (nextSample) {
						data.discard(
							nextSample.samplePosition.offset - data.counter.getOffset(),
						);
						continue;
					} else {
						data.discard(possibleAtomLength);
						break;
					}
				}

				data.peekB(8);
			}

			throw new Error(
				'Could not find sample with offset ' + data.counter.getOffset(),
			);
		}

		const bytes = data.getSlice(sampleWithIndex.samplePosition.size);

		if (sampleWithIndex.track.type === 'audio') {
			options.parserState.onAudioSample(sampleWithIndex.track.trackId, {
				data: bytes,
				timestamp: sampleWithIndex.samplePosition.offset,
				offset: data.counter.getOffset(),
				trackId: sampleWithIndex.track.trackId,
			});
		}

		if (sampleWithIndex.track.type === 'video') {
			const timestamp =
				(sampleWithIndex.samplePosition.cts * 1_000_000) /
				sampleWithIndex.track.timescale;
			const duration =
				(sampleWithIndex.samplePosition.duration * 1_000_000) /
				sampleWithIndex.track.timescale;

			options.parserState.onVideoSample(sampleWithIndex.track.trackId, {
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
		if (remaining === 0) {
			break;
		}
	}

	return {
		type: 'mdat-box',
		boxSize: size,
		samplesProcessed: true,
		fileOffset,
	};
};
