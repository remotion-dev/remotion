import type {BufferIterator} from '../../../buffer-iterator';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../../convert-audio-or-video-sample';
import {getHasTracks, getTracks} from '../../../get-tracks';
import {maySkipVideoData} from '../../../may-skip-video-data/may-skip-video-data';
import type {IsoBaseMediaStructure} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import {getSamplePositionsFromTrack} from '../get-sample-positions-from-track';
import type {TrakBox} from '../trak/trak';
import {getMoofBox} from '../traversal';

export const parseMdatSection = async ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}): Promise<number | null> => {
	const videoSection = state.videoSection.getVideoSection();
	// don't need mdat at all, can skip
	if (maySkipVideoData({state})) {
		return videoSection.size + videoSection.start;
	}

	const alreadyHas = getHasTracks(state.structure.getStructure(), state);
	if (!alreadyHas) {
		// Will first read the end and then return
		if (state.supportsContentRange) {
			state.iso.setShouldReturnToVideoSectionAfterEnd(true);

			return videoSection.size + videoSection.start;
		}

		throw new Error(
			'Source does not support reading partially, but metadata is at the end of the file. This would require buffering the entire file in memory, leading to a leak. Remotion does not currently support this scenario, make sure to pass a source that supports Content-Range.',
		);
	}

	const tracks = getTracks(state.structure.getStructure(), state);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	const flatSamples = allTracks
		.map((track) => {
			const samplePositions = getSamplePositionsFromTrack(
				track.trakBox as TrakBox,
				getMoofBox(
					(state.structure.getStructure() as IsoBaseMediaStructure).boxes,
				),
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

	const samplesWithIndex = flatSamples.find((sample) => {
		return sample.samplePosition.offset === iterator.counter.getOffset();
	});
	if (!samplesWithIndex) {
		// There are various reasons why in mdat we find weird stuff:
		// - iphonevideo.hevc has a fake hoov atom which is not mapped
		// - corrupted.mp4 has a corrupt table
		const nextSample_ = flatSamples
			.filter((s) => s.samplePosition.offset > iterator.counter.getOffset())
			.sort((a, b) => a.samplePosition.offset - b.samplePosition.offset)[0];
		if (nextSample_) {
			iterator.discard(
				nextSample_.samplePosition.offset - iterator.counter.getOffset(),
			);
			return null;
		}

		// guess we reached the end!
		// iphonevideo.mov has extra padding here, so let's make sure to jump ahead
		return videoSection.size + videoSection.start;
	}

	if (iterator.bytesRemaining() < samplesWithIndex.samplePosition.size) {
		return null;
	}

	const bytes = iterator.getSlice(samplesWithIndex.samplePosition.size);

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

	iterator.removeBytesRead();
	return null;
};
