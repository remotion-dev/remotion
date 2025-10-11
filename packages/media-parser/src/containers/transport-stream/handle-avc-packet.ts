import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {MediaParserTrack} from '../../get-tracks';
import type {MediaParserLogLevel} from '../../log';
import {registerVideoTrack} from '../../register-track';
import type {AvcState} from '../../state/avc/avc-state';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {
	MediaParserOnVideoTrack,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
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
import {mediaParserAdvancedColorToWebCodecsColor} from '../iso-base-media/color-to-webcodecs-colors';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const MPEG_TIMESCALE = 90000;

export const handleAvcPacket = async ({
	streamBuffer,
	programId,
	offset,
	sampleCallbacks,
	logLevel,
	onVideoTrack,
	transportStream,
	makeSamplesStartAtZero,
	avcState,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	programId: number;
	offset: number;
	sampleCallbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onVideoTrack: MediaParserOnVideoTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
	avcState: AvcState;
}) => {
	const avc = parseAvc(streamBuffer.getBuffer(), avcState);
	const isTrackRegistered = sampleCallbacks.tracks.getTracks().find((t) => {
		return t.trackId === programId;
	});
	if (!isTrackRegistered) {
		const spsAndPps = getSpsAndPps(avc);
		const dimensions = getDimensionsFromSps(spsAndPps.sps.spsData);
		const sampleAspectRatio = getSampleAspectRatioFromSps(
			spsAndPps.sps.spsData,
		);
		const startOffset = makeSamplesStartAtZero
			? Math.min(
					streamBuffer.pesHeader.pts,
					streamBuffer.pesHeader.dts ?? Infinity,
				)
			: 0;
		transportStream.startOffset.setOffset({
			trackId: programId,
			newOffset: startOffset,
		});

		const codecPrivate = createSpsPpsData(spsAndPps);

		const advancedColor = getVideoColorFromSps(spsAndPps.sps.spsData);

		const track: MediaParserTrack = {
			m3uStreamFormat: null,
			rotation: 0,
			trackId: programId,
			type: 'video',
			originalTimescale: MPEG_TIMESCALE,
			codec: getCodecStringFromSpsAndPps(spsAndPps.sps),
			codecData: {type: 'avc-sps-pps', data: codecPrivate},
			fps: null,
			codedWidth: dimensions.width,
			codedHeight: dimensions.height,
			height: dimensions.height,
			width: dimensions.width,
			displayAspectWidth: dimensions.width,
			displayAspectHeight: dimensions.height,
			codecEnum: 'h264',
			// ChatGPT: In a transport stream (⁠.ts), H.264 video is always stored in Annex B format
			// WebCodecs spec says that description must be undefined for Annex B format
			// https://www.w3.org/TR/webcodecs-avc-codec-registration/#videodecoderconfig-description
			description: undefined,
			sampleAspectRatio: {
				denominator: sampleAspectRatio.height,
				numerator: sampleAspectRatio.width,
			},
			colorSpace: mediaParserAdvancedColorToWebCodecsColor(advancedColor),
			advancedColor,
			startInSeconds: 0,
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
		};

		await registerVideoTrack({
			track,
			container: 'transport-stream',
			logLevel,
			onVideoTrack,
			registerVideoSampleCallback: sampleCallbacks.registerVideoSampleCallback,
			tracks: sampleCallbacks.tracks,
		});
	}

	const type = getKeyFrameOrDeltaFromAvcInfo(avc);

	// sample for webcodecs needs to be in nano seconds
	const sample: MediaParserVideoSample = {
		decodingTimestamp:
			(streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts) -
			transportStream.startOffset.getOffset(programId),
		timestamp:
			streamBuffer.pesHeader.pts -
			transportStream.startOffset.getOffset(programId),
		duration: undefined,
		data: streamBuffer.getBuffer(),
		type: type === 'bidirectional' ? 'delta' : type,
		offset,
	};

	if (type === 'key') {
		transportStream.observedPesHeaders.markPtsAsKeyframe(
			streamBuffer.pesHeader.pts,
		);
	}

	const videoSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
		sample,
		timescale: MPEG_TIMESCALE,
	});

	await sampleCallbacks.onVideoSample({
		videoSample,
		trackId: programId,
	});

	transportStream.lastEmittedSample.setLastEmittedSample(sample);
};
