import {mapAudioObjectTypeToCodecString} from '../../aac-codecprivate';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {MediaParserAudioTrack} from '../../get-tracks';
import type {MediaParserLogLevel} from '../../log';
import {registerAudioTrack} from '../../register-track';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {
	MediaParserAudioSample,
	MediaParserOnAudioTrack,
} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import {readAdtsHeader} from './adts-header';
import {MPEG_TIMESCALE} from './handle-avc-packet';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const handleAacPacket = async ({
	streamBuffer,
	programId,
	offset,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	transportStream,
	makeSamplesStartAtZero,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	programId: number;
	offset: number;
	sampleCallbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onAudioTrack: MediaParserOnAudioTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
}) => {
	const adtsHeader = readAdtsHeader(streamBuffer.getBuffer());
	if (!adtsHeader) {
		throw new Error('Invalid ADTS header - too short');
	}

	const {channelConfiguration, codecPrivate, sampleRate, audioObjectType} =
		adtsHeader;

	const isTrackRegistered = sampleCallbacks.tracks.getTracks().find((t) => {
		return t.trackId === programId;
	});

	if (!isTrackRegistered) {
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

		const track: MediaParserAudioTrack = {
			type: 'audio',
			codecData: {type: 'aac-config', data: codecPrivate},
			trackId: programId,
			originalTimescale: MPEG_TIMESCALE,
			codecEnum: 'aac',
			codec: mapAudioObjectTypeToCodecString(audioObjectType),
			// https://www.w3.org/TR/webcodecs-aac-codec-registration/
			// WebCodecs spec says that description should be given for AAC format
			// ChatGPT says that Transport Streams are always AAC, not ADTS
			description: codecPrivate,
			numberOfChannels: channelConfiguration,
			sampleRate,
			startInSeconds: 0,
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
		};
		await registerAudioTrack({
			track,
			container: 'transport-stream',
			registerAudioSampleCallback: sampleCallbacks.registerAudioSampleCallback,
			tracks: sampleCallbacks.tracks,
			logLevel,
			onAudioTrack,
		});
	}

	const sample: MediaParserAudioSample = {
		decodingTimestamp:
			(streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts) -
			transportStream.startOffset.getOffset(programId),
		timestamp:
			streamBuffer.pesHeader.pts -
			transportStream.startOffset.getOffset(programId),
		duration: undefined,
		data: streamBuffer.getBuffer(),
		type: 'key',
		offset,
	};

	const audioSample = convertAudioOrVideoSampleToWebCodecsTimestamps({
		sample,
		timescale: MPEG_TIMESCALE,
	});

	await sampleCallbacks.onAudioSample({
		audioSample,
		trackId: programId,
	});

	transportStream.lastEmittedSample.setLastEmittedSample(sample);
};
