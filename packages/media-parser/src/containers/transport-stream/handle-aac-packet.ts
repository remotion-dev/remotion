import {mapAudioObjectTypeToCodecString} from '../../aac-codecprivate';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import {emitAudioSample} from '../../emit-audio-sample';
import type {Track} from '../../get-tracks';
import type {LogLevel} from '../../log';
import {registerAudioTrack} from '../../register-track';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import type {TransportStreamState} from '../../state/transport-stream/transport-stream';
import type {
	AudioOrVideoSample,
	OnAudioTrack,
} from '../../webcodec-sample-types';
import type {WorkOnSeekRequestOptions} from '../../work-on-seek-request';
import {readAdtsHeader} from './adts-header';
import {MPEG_TIMESCALE} from './handle-avc-packet';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const handleAacPacket = async ({
	streamBuffer,
	programId,
	offset,
	workOnSeekRequestOptions,
	sampleCallbacks,
	logLevel,
	onAudioTrack,
	transportStream,
	makeSamplesStartAtZero,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	programId: number;
	offset: number;
	workOnSeekRequestOptions: WorkOnSeekRequestOptions;
	sampleCallbacks: SampleCallbacks;
	logLevel: LogLevel;
	onAudioTrack: OnAudioTrack | null;
	transportStream: TransportStreamState;
	makeSamplesStartAtZero: boolean;
}) => {
	const adtsHeader = readAdtsHeader(streamBuffer.buffer);
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
		transportStream.startOffset.setOffset(startOffset);

		const track: Track = {
			type: 'audio',
			codecPrivate,
			trackId: programId,
			trakBox: null,
			timescale: MPEG_TIMESCALE,
			codecWithoutConfig: 'aac',
			codec: mapAudioObjectTypeToCodecString(audioObjectType),
			// https://www.w3.org/TR/webcodecs-aac-codec-registration/
			description: undefined,
			numberOfChannels: channelConfiguration,
			sampleRate,
		};
		await registerAudioTrack({
			track,
			container: 'transport-stream',
			workOnSeekRequestOptions,
			registerAudioSampleCallback: sampleCallbacks.registerAudioSampleCallback,
			tracks: sampleCallbacks.tracks,
			logLevel,
			onAudioTrack,
		});
	}

	const sample: AudioOrVideoSample = {
		cts: streamBuffer.pesHeader.pts - transportStream.startOffset.getOffset(),
		dts:
			(streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts) -
			transportStream.startOffset.getOffset(),
		timestamp:
			streamBuffer.pesHeader.pts - transportStream.startOffset.getOffset(),
		duration: undefined,
		data: new Uint8Array(streamBuffer.buffer),
		trackId: programId,
		type: 'key',
		offset,
		timescale: MPEG_TIMESCALE,
	};

	await emitAudioSample({
		trackId: programId,
		audioSample: convertAudioOrVideoSampleToWebCodecsTimestamps({
			sample,
			timescale: MPEG_TIMESCALE,
		}),
		workOnSeekRequestOptions,
		callbacks: sampleCallbacks,
	});

	transportStream.lastEmittedSample.setLastEmittedSample(sample);
};
