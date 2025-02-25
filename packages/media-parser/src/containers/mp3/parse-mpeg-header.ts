// spec: http://www.mp3-tech.org/programmer/frame_header.html

import {Log} from '../../log';
import {registerAudioTrack} from '../../register-track';
import type {Mp3Info} from '../../state/mp3';
import type {ParserState} from '../../state/parser-state';
import {
	getAverageMpegFrameLength,
	getMpegFrameLength,
} from './get-frame-length';
import {getSamplesPerMpegFrame} from './samples-per-mpeg-file';

type Version = 1 | 2;
type Level = 1 | 2 | 3;

type MpegVersion = 1 | 2;

function getSamplingFrequency({
	bits,
	mpegVersion,
}: {
	bits: number;
	mpegVersion: MpegVersion;
}): number {
	const samplingTable: Record<number, Record<string, number | 'reserved'>> = {
		0b00: {MPEG1: 44100, MPEG2: 22050},
		0b01: {MPEG1: 48000, MPEG2: 24000},
		0b10: {MPEG1: 32000, MPEG2: 16000},
		0b11: {MPEG1: 'reserved', MPEG2: 'reserved'},
	};

	const key = `MPEG${mpegVersion}`;
	const value = samplingTable[bits][key];
	if (value === 'reserved') {
		throw new Error('Reserved sampling frequency');
	}

	if (!value) {
		throw new Error(
			'Invalid sampling frequency for MPEG version: ' +
				JSON.stringify({bits, version: mpegVersion}),
		);
	}

	return value;
}

function getBitrateKB({
	bits,
	mpegVersion,
	level,
}: {
	bits: number;
	mpegVersion: Version;
	level: Level;
}): number | 'free' | 'bad' {
	const bitrateTable: Record<
		number,
		Record<string, number | 'free' | 'bad'>
	> = {
		0b0000: {
			'V1,L1': 'free',
			'V1,L2': 'free',
			'V1,L3': 'free',
			'V2,L1': 'free',
			'V2,L2&L3': 'free',
		},
		0b0001: {'V1,L1': 32, 'V1,L2': 32, 'V1,L3': 32, 'V2,L1': 32, 'V2,L2&L3': 8},
		0b0010: {
			'V1,L1': 64,
			'V1,L2': 48,
			'V1,L3': 40,
			'V2,L1': 48,
			'V2,L2&L3': 16,
		},
		0b0011: {
			'V1,L1': 96,
			'V1,L2': 56,
			'V1,L3': 48,
			'V2,L1': 56,
			'V2,L2&L3': 24,
		},
		0b0100: {
			'V1,L1': 128,
			'V1,L2': 64,
			'V1,L3': 56,
			'V2,L1': 64,
			'V2,L2&L3': 32,
		},
		0b0101: {
			'V1,L1': 160,
			'V1,L2': 80,
			'V1,L3': 64,
			'V2,L1': 80,
			'V2,L2&L3': 40,
		},
		0b0110: {
			'V1,L1': 192,
			'V1,L2': 96,
			'V1,L3': 80,
			'V2,L1': 96,
			'V2,L2&L3': 48,
		},
		0b0111: {
			'V1,L1': 224,
			'V1,L2': 112,
			'V1,L3': 96,
			'V2,L1': 112,
			'V2,L2&L3': 56,
		},
		0b1000: {
			'V1,L1': 256,
			'V1,L2': 128,
			'V1,L3': 112,
			'V2,L1': 128,
			'V2,L2&L3': 64,
		},
		0b1001: {
			'V1,L1': 288,
			'V1,L2': 160,
			'V1,L3': 128,
			'V2,L1': 144,
			'V2,L2&L3': 80,
		},
		0b1010: {
			'V1,L1': 320,
			'V1,L2': 192,
			'V1,L3': 160,
			'V2,L1': 160,
			'V2,L2&L3': 96,
		},
		0b1011: {
			'V1,L1': 352,
			'V1,L2': 224,
			'V1,L3': 192,
			'V2,L1': 176,
			'V2,L2&L3': 112,
		},
		0b1100: {
			'V1,L1': 384,
			'V1,L2': 256,
			'V1,L3': 224,
			'V2,L1': 192,
			'V2,L2&L3': 128,
		},
		0b1101: {
			'V1,L1': 416,
			'V1,L2': 320,
			'V1,L3': 256,
			'V2,L1': 224,
			'V2,L2&L3': 144,
		},
		0b1110: {
			'V1,L1': 448,
			'V1,L2': 384,
			'V1,L3': 320,
			'V2,L1': 256,
			'V2,L2&L3': 160,
		},
		0b1111: {
			'V1,L1': 'bad',
			'V1,L2': 'bad',
			'V1,L3': 'bad',
			'V2,L1': 'bad',
			'V2,L2&L3': 'bad',
		},
	};

	// Determine the correct key based on version and level
	let key: string;
	if (mpegVersion === 2 && (level === 2 || level === 3)) {
		key = 'V2,L2&L3';
	} else {
		key = `V${mpegVersion},L${level}`;
	}

	// Return the corresponding bitrate
	return bitrateTable[bits][key];
}

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

	iterator.startReadingBits();
	for (let i = 0; i < 11; i++) {
		const expectToBe1 = iterator.getBits(1);
		if (expectToBe1 !== 1) {
			throw new Error('Expected 1');
		}
	}

	const audioVersionId = iterator.getBits(2);
	/**
   * 00 - MPEG Version 2.5 (later extension of MPEG 2)
     01 - reserved
     10 - MPEG Version 2 (ISO/IEC 13818-3)
     11 - MPEG Version 1 (ISO/IEC 11172-3)
   */
	if (audioVersionId !== 0b11 && audioVersionId !== 0b10) {
		throw new Error('Expected MPEG Version 1 or 2');
	}

	const mpegVersion = audioVersionId === 0b11 ? 1 : 2;

	const layerBits = iterator.getBits(2);
	/**
   * 00 - reserved
     01 - Layer III
     10 - Layer II
     11 - Layer I
   */
	if (layerBits === 0b00) {
		throw new Error('Expected Layer I, II or III');
	}

	const layer = layerBits === 0b11 ? 1 : layerBits === 0b10 ? 2 : 3;

	const protectionBit = iterator.getBits(1);
	if (protectionBit !== 0b1) {
		throw new Error('Does not support CRC yet');
	}

	const bitrateIndex = iterator.getBits(4);
	const bitrateKbit = getBitrateKB({
		bits: bitrateIndex,
		mpegVersion,
		level: audioVersionId as Level,
	});
	if (bitrateKbit === 'bad') {
		throw new Error('Invalid bitrate');
	}

	if (bitrateKbit === 'free') {
		throw new Error('Free bitrate not supported');
	}

	const samplingFrequencyIndex = iterator.getBits(2);

	const sampleRate = getSamplingFrequency({
		bits: samplingFrequencyIndex,
		mpegVersion,
	});
	const padding = Boolean(iterator.getBits(1));
	iterator.getBits(1); // private bit
	const channelMode = iterator.getBits(2); // channel mode
	iterator.getBits(2); // mode extension
	iterator.getBits(1); // copyright
	iterator.getBits(1); // original
	iterator.getBits(2); // emphasis

	const numberOfChannels = channelMode === 0b11 ? 1 : 2;

	const samplesPerFrame = getSamplesPerMpegFrame({mpegVersion, layer});

	const frameLength = getMpegFrameLength({
		bitrateKbit,
		padding,
		samplesPerFrame,
		samplingFrequency: sampleRate,
		layer,
	});

	iterator.stopReadingBits();

	const offsetNow = iterator.counter.getOffset();
	iterator.counter.decrement(offsetNow - initialOffset);
	const data = iterator.getSlice(frameLength);

	let isInfoTag = false;

	if (state.callbacks.tracks.getTracks().length === 0) {
		const info: Mp3Info = {
			layer,
			mpegVersion,
			sampleRate,
			startOfMpegStream: initialOffset,
		};
		const asText = new TextDecoder().decode(data);

		const isVbr = asText.includes('Xing') || asText.includes('VBRI');
		isInfoTag = isVbr || asText.includes('Info');
		if (isVbr) {
			Log.verbose(
				state.logLevel,
				'MP3 has variable bit rate. Requiring whole file to be read',
			);
		} else {
			state.mp3Info.setCbrMp3Info({
				bitrateKbit,
			});
		}

		if (!isInfoTag) {
			state.mp3Info.setMp3Info(info);
			await registerAudioTrack({
				container: 'mp3',
				state,
				track: {
					type: 'audio',
					codec: 'mp3',
					codecPrivate: null,
					codecWithoutConfig: 'mp3',
					description: undefined,
					numberOfChannels,
					sampleRate,
					timescale: 1_000_000,
					trackId: 0,
					trakBox: null,
				},
			});
			state.callbacks.tracks.setIsDone(state.logLevel);
		}
	}

	const avgLength = getAverageMpegFrameLength({
		bitrateKbit,
		layer,
		samplesPerFrame,
		samplingFrequency: sampleRate,
	});

	if (!isInfoTag) {
		const mp3Info = state.mp3Info.getMp3Info();
		if (!mp3Info) {
			throw new Error('No MP3 info');
		}

		const nthFrame = Math.round(
			(initialOffset - mp3Info.startOfMpegStream) / avgLength,
		);

		const durationInSeconds = samplesPerFrame / sampleRate;
		const timeInSeconds = (nthFrame * samplesPerFrame) / sampleRate;
		const timestamp = Math.round(timeInSeconds * 1_000_000);
		const duration = Math.round(durationInSeconds * 1_000_000);
		await state.callbacks.onAudioSample(0, {
			data,
			cts: timestamp,
			dts: timestamp,
			duration,
			offset: initialOffset,
			timescale: 1_000_000,
			timestamp,
			trackId: 0,
			type: 'key',
		});
	}
};
