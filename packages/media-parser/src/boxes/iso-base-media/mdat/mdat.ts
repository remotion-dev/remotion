/* eslint-disable max-depth */
import type {BufferIterator} from '../../../buffer-iterator';
import {getTracks, hasTracks} from '../../../get-tracks';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import {getSamplePositionsFromTrack} from '../get-sample-positions-from-track';
import type {TrakBox} from '../trak/trak';
import {getMoofBox} from '../traversal';

type MdatStatus =
	| {
			status: 'samples-buffered';
	  }
	| {
			status: 'samples-skipped';
	  }
	| {
			status: 'samples-processed';
	  };

export type MdatBox = {
	type: 'mdat-box';
	boxSize: number;
	fileOffset: number;
} & MdatStatus;

export const parseMdat = async ({
	data,
	size,
	fileOffset,
	existingBoxes,
	options,
	signal,
	maySkipSampleProcessing,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
	existingBoxes: AnySegment[];
	options: ParserContext;
	signal: AbortSignal | null;
	maySkipSampleProcessing: boolean;
}): Promise<MdatBox> => {
	const alreadyHas = hasTracks(existingBoxes);
	if (!alreadyHas) {
		if (maySkipSampleProcessing) {
			data.discard(size - (data.counter.getOffset() - fileOffset));
			return Promise.resolve({
				type: 'mdat-box',
				boxSize: size,
				status: 'samples-skipped',
				fileOffset,
			});
		}

		data.discard(size - (data.counter.getOffset() - fileOffset));

		data.disallowDiscard();
		return Promise.resolve({
			type: 'mdat-box',
			boxSize: size,
			status: 'samples-buffered',
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
			const samplePositions = getSamplePositionsFromTrack(
				track.trakBox as TrakBox,
				getMoofBox(existingBoxes),
			);
			if (!samplePositions) {
				throw new Error('No sample positions');
			}

			return samplePositions.map((samplePosition) => {
				return {
					track: {...track},
					samplePosition,
				};
			});
		})
		.flat(1);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (signal && signal.aborted) {
			break;
		}

		const samplesWithIndex = flatSamples.find((sample) => {
			return sample.samplePosition.offset === data.counter.getOffset();
		});
		if (!samplesWithIndex) {
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

		if (data.bytesRemaining() < samplesWithIndex.samplePosition.size) {
			break;
		}

		const bytes = data.getSlice(samplesWithIndex.samplePosition.size);

		if (samplesWithIndex.track.type === 'audio') {
			const timestamp = Math.floor(
				(samplesWithIndex.samplePosition.cts * 1_000_000) /
					samplesWithIndex.track.timescale,
			);
			await options.parserState.onAudioSample(samplesWithIndex.track.trackId, {
				data: bytes,
				timestamp,
				trackId: samplesWithIndex.track.trackId,
				type: samplesWithIndex.samplePosition.isKeyframe ? 'key' : 'delta',
			});
		}

		if (samplesWithIndex.track.type === 'video') {
			const timestamp = Math.floor(
				(samplesWithIndex.samplePosition.cts * 1_000_000) /
					samplesWithIndex.track.timescale,
			);
			const duration = Math.floor(
				(samplesWithIndex.samplePosition.duration * 1_000_000) /
					samplesWithIndex.track.timescale,
			);

			await options.parserState.onVideoSample(samplesWithIndex.track.trackId, {
				data: bytes,
				timestamp,
				duration,
				cts: samplesWithIndex.samplePosition.cts,
				dts: samplesWithIndex.samplePosition.dts,
				trackId: samplesWithIndex.track.trackId,
				type: samplesWithIndex.samplePosition.isKeyframe ? 'key' : 'delta',
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
		status: 'samples-processed',
		fileOffset,
	});
};
