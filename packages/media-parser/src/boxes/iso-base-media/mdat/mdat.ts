import type {BufferIterator} from '../../../buffer-iterator';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../../convert-audio-or-video-sample';
import {getTracks, hasTracks} from '../../../get-tracks';
import type {IsoBaseMediaBox} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
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
	state,
	signal,
	maySkipSampleProcessing,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
	existingBoxes: IsoBaseMediaBox[];
	state: ParserState;
	signal: AbortSignal | null;
	maySkipSampleProcessing: boolean;
}): Promise<MdatBox> => {
	const alreadyHas = hasTracks(
		{
			type: 'iso-base-media',
			boxes: existingBoxes,
		},
		state,
	);
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

	const tracks = getTracks(
		{type: 'iso-base-media', boxes: existingBoxes},
		state,
	);
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

		const {cts, dts, duration, isKeyframe, offset} =
			samplesWithIndex.samplePosition;

		if (samplesWithIndex.track.type === 'audio') {
			await state.callbacks.onAudioSample(
				samplesWithIndex.track.trackId,
				convertAudioOrVideoSampleToWebCodecsTimestamps(
					{
						data: bytes,
						timestamp: cts,
						duration,
						cts,
						dts,
						trackId: samplesWithIndex.track.trackId,
						type: isKeyframe ? 'key' : 'delta',
						offset,
						timescale: samplesWithIndex.track.timescale,
					},
					samplesWithIndex.track.timescale,
				),
			);
		}

		if (samplesWithIndex.track.type === 'video') {
			// https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/sei_checkpoint.mp4
			// Position in file 0x0001aba615
			// https://github.com/remotion-dev/remotion/issues/4680
			// In Chrome, we may not treat recovery points as keyframes
			// otherwise "a keyframe is required after flushing"
			const nalUnitType = bytes[4] & 0b00011111;
			let isRecoveryPoint = false;
			// SEI (Supplemental enhancement information)
			if (nalUnitType === 6) {
				const seiType = bytes[5];
				isRecoveryPoint = seiType === 6;
			}

			await state.callbacks.onVideoSample(
				samplesWithIndex.track.trackId,
				convertAudioOrVideoSampleToWebCodecsTimestamps(
					{
						data: bytes,
						timestamp: cts,
						duration,
						cts,
						dts,
						trackId: samplesWithIndex.track.trackId,
						type: isKeyframe && !isRecoveryPoint ? 'key' : 'delta',
						offset,
						timescale: samplesWithIndex.track.timescale,
					},
					samplesWithIndex.track.timescale,
				),
			);
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
