import {mapAudioObjectTypeToCodecString} from '../../aac-codecprivate';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {Track} from '../../get-tracks';
import {registerAudioTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';
import {readAdtsHeader} from './adts-header';
import {MPEG_TIMESCALE} from './handle-avc-packet';
import type {TransportStreamPacketBuffer} from './process-stream-buffers';

export const handleAacPacket = async ({
	streamBuffer,
	state,
	programId,
	offset,
}: {
	streamBuffer: TransportStreamPacketBuffer;
	state: ParserState;
	programId: number;
	offset: number;
}) => {
	const adtsHeader = readAdtsHeader(streamBuffer.buffer);
	if (!adtsHeader) {
		throw new Error('Invalid ADTS header - too short');
	}

	const {channelConfiguration, codecPrivate, sampleRate, audioObjectType} =
		adtsHeader;

	const isTrackRegistered = state.callbacks.tracks.getTracks().find((t) => {
		return t.trackId === programId;
	});

	if (!isTrackRegistered) {
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
			state,
			container: 'transport-stream',
		});
	}

	const sample: AudioOrVideoSample = {
		cts: streamBuffer.pesHeader.pts,
		dts: streamBuffer.pesHeader.dts ?? streamBuffer.pesHeader.pts,
		timestamp: streamBuffer.pesHeader.pts,
		duration: undefined,
		data: new Uint8Array(streamBuffer.buffer),
		trackId: programId,
		type: 'key',
		offset,
		timescale: MPEG_TIMESCALE,
	};

	await state.callbacks.onAudioSample(
		programId,
		convertAudioOrVideoSampleToWebCodecsTimestamps(sample, MPEG_TIMESCALE),
	);
};
