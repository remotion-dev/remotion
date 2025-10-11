// spec: http://www.mp3-tech.org/programmer/frame_header.html

import {Log} from '../../log';
import {registerAudioTrack} from '../../register-track';
import type {Mp3Info} from '../../state/mp3';
import type {ParserState} from '../../state/parser-state';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import {parseMp3PacketHeader} from './parse-packet-header';
import {parseXing} from './parse-xing';
import {getAudioSampleFromCbr} from './seek/audio-sample-from-cbr';
import {getAudioSampleFromVbr} from './seek/audio-sample-from-vbr';

export const parseMpegHeader = async ({
	state,
}: {
	state: ParserState;
}): Promise<void> => {
	const {iterator} = state;
	const initialOffset = iterator.counter.getOffset();

	if (iterator.bytesRemaining() < 32) {
		return;
	}

	// parse header
	const {
		frameLength,
		bitrateInKbit,
		layer,
		mpegVersion,
		numberOfChannels,
		sampleRate,
		samplesPerFrame,
	} = parseMp3PacketHeader(iterator);

	const cbrMp3Info = state.mp3.getMp3BitrateInfo();
	if (cbrMp3Info && cbrMp3Info.type === 'constant') {
		if (bitrateInKbit !== cbrMp3Info.bitrateInKbit) {
			throw new Error(
				`Bitrate mismatch at offset ${initialOffset}: ${bitrateInKbit} !== ${cbrMp3Info.bitrateInKbit}`,
			);
		}
	}

	const offsetNow = iterator.counter.getOffset();
	iterator.counter.decrement(offsetNow - initialOffset);
	const data = iterator.getSlice(frameLength);

	if (state.callbacks.tracks.getTracks().length === 0) {
		const info: Mp3Info = {
			layer,
			mpegVersion,
			sampleRate,
		};
		const asText = new TextDecoder().decode(data);
		if (asText.includes('VBRI')) {
			throw new Error(
				'MP3 files with VBRI are currently unsupported because we have no sample file. Submit this file at remotion.dev/report if you would like us to support this file.',
			);
		}

		if (asText.includes('Info')) {
			return;
		}

		const isVbr = asText.includes('Xing');
		if (isVbr) {
			const xingData = parseXing(data);
			Log.verbose(
				state.logLevel,
				'MP3 has variable bit rate. Requiring whole file to be read',
			);
			state.mp3.setMp3BitrateInfo({
				type: 'variable',
				xingData,
			});
			return;
		}

		if (!state.mp3.getMp3BitrateInfo()) {
			state.mp3.setMp3BitrateInfo({
				bitrateInKbit,
				type: 'constant',
			});
		}

		state.mp3.setMp3Info(info);

		await registerAudioTrack({
			container: 'mp3',
			track: {
				type: 'audio',
				codec: 'mp3',
				codecData: null,
				codecEnum: 'mp3',
				description: undefined,
				numberOfChannels,
				sampleRate,
				originalTimescale: 1_000_000,
				trackId: 0,
				startInSeconds: 0,
				timescale: WEBCODECS_TIMESCALE,
				trackMediaTimeOffsetInTrackTimescale: 0,
			},
			registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
			tracks: state.callbacks.tracks,
			logLevel: state.logLevel,
			onAudioTrack: state.onAudioTrack,
		});
		state.callbacks.tracks.setIsDone(state.logLevel);

		state.mediaSection.addMediaSection({
			start: initialOffset,
			size: state.contentLength - initialOffset,
		});
	}

	const bitrateInfo = state.mp3.getMp3BitrateInfo();
	if (!bitrateInfo) {
		throw new Error('No bitrate info');
	}

	const sample =
		bitrateInfo.type === 'constant'
			? getAudioSampleFromCbr({
					bitrateInKbit,
					data,
					initialOffset,
					layer,
					sampleRate,
					samplesPerFrame,
					state,
				})
			: getAudioSampleFromVbr({
					data,
					info: bitrateInfo,
					mp3Info: state.mp3.getMp3Info(),
					position: initialOffset,
				});

	const {audioSample, timeInSeconds, durationInSeconds} = sample;

	state.mp3.audioSamples.addSample({
		timeInSeconds,
		offset: initialOffset,
		durationInSeconds,
	});

	await state.callbacks.onAudioSample({
		audioSample,
		trackId: 0,
	});
};
