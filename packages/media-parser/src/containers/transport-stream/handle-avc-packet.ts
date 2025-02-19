import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {Track} from '../../get-tracks';
import {registerVideoTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';
import {getCodecStringFromSpsAndPps} from '../avc/codec-string';
import {createSpsPpsData} from '../avc/create-sps-pps-data';
import {
	getDimensionsFromSps,
	getSampleAspectRatioFromSps,
	getVideoColorFromSps,
} from '../avc/interpret-sps';
import {getKeyFrameOrDeltaFromAvcInfo} from '../avc/key';
import {parseAvc} from '../avc/parse-avc';
import {getSpsAndPps} from '../avc/sps-and-pps';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const MPEG_TIMESCALE = 90000;

export const handleAvcPacket = async ({
	streamBuffer,
	programId,
	state,
	offset,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	programId: number;
	state: ParserState;
	offset: number;
}) => {
	const avc = parseAvc(streamBuffer.buffer);
	const isTrackRegistered = state.callbacks.tracks.getTracks().find((t) => {
		return t.trackId === programId;
	});

	if (!isTrackRegistered) {
		const spsAndPps = getSpsAndPps(avc);
		const dimensions = getDimensionsFromSps(spsAndPps.sps.spsData);
		const sampleAspectRatio = getSampleAspectRatioFromSps(
			spsAndPps.sps.spsData,
		);

		const track: Track = {
			rotation: 0,
			trackId: programId,
			type: 'video',
			timescale: MPEG_TIMESCALE,
			codec: getCodecStringFromSpsAndPps(spsAndPps.sps),
			codecPrivate: createSpsPpsData(spsAndPps),
			fps: null,
			codedWidth: dimensions.width,
			codedHeight: dimensions.height,
			height: dimensions.height,
			width: dimensions.width,
			displayAspectWidth: dimensions.width,
			displayAspectHeight: dimensions.height,
			trakBox: null,
			codecWithoutConfig: 'h264',
			description: undefined,
			sampleAspectRatio: {
				denominator: sampleAspectRatio.height,
				numerator: sampleAspectRatio.width,
			},
			color: getVideoColorFromSps(spsAndPps.sps.spsData),
		};

		await registerVideoTrack({track, state, container: 'transport-stream'});
	}

	// sample for webcodecs needs to be in nano seconds
	const sample: AudioOrVideoSample = {
		cts: streamBuffer.pesHeader.pts,
		dts: streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts,
		timestamp: streamBuffer.pesHeader.pts,
		duration: undefined,
		data: new Uint8Array(streamBuffer.buffer),
		trackId: programId,
		type: getKeyFrameOrDeltaFromAvcInfo(avc),
		offset,
		timescale: MPEG_TIMESCALE,
	};

	await state.callbacks.onVideoSample(
		programId,
		convertAudioOrVideoSampleToWebCodecsTimestamps(sample, MPEG_TIMESCALE),
	);
};
