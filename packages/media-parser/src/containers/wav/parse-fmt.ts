import type {ParseResult} from '../../parse-result';
import {registerAudioTrack} from '../../register-track';
import type {ParserState} from '../../state/parser-state';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';
import {subformatIsIeeeFloat, subformatIsPcm} from './subformats';
import type {WavFmt} from './types';

const CHANNELS: {[bit: number]: string} = {
	0: 'Front Left',
	1: 'Front Right',
	2: 'Front Center',
	3: 'Low Frequency',
	4: 'Back Left',
	5: 'Back Right',
	6: 'Front Left of Center',
	7: 'Front Right of Center',
	8: 'Back Center',
	9: 'Side Left',
	10: 'Side Right',
	11: 'Top Center',
	12: 'Top Front Left',
	13: 'Top Front Center',
	14: 'Top Front Right',
	15: 'Top Back Left',
	16: 'Top Back Center',
	17: 'Top Back Right',
	// Add more if needed as per the spec
};

export function getChannelsFromMask(channelMask: number): string[] {
	const channels: string[] = [];
	for (let bit = 0; bit < 18; bit++) {
		if ((channelMask & (1 << bit)) !== 0) {
			const channelName = CHANNELS[bit];
			if (channelName) {
				channels.push(channelName);
			} else {
				channels.push(`Unknown Channel (bit ${bit})`);
			}
		}
	}

	return channels;
}

export const parseFmt = async ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const ckSize = iterator.getUint32Le(); // chunkSize
	const box = iterator.startBox(ckSize);
	const audioFormat = iterator.getUint16Le();
	if (audioFormat !== 1 && audioFormat !== 65534) {
		throw new Error(
			`Only supporting WAVE with PCM audio format, but got ${audioFormat}`,
		);
	}

	const numberOfChannels = iterator.getUint16Le();
	const sampleRate = iterator.getUint32Le();
	const byteRate = iterator.getUint32Le();
	const blockAlign = iterator.getUint16Le();
	const bitsPerSample = iterator.getUint16Le();

	const format =
		bitsPerSample === 16
			? 'pcm-s16'
			: bitsPerSample === 32
				? 'pcm-s32'
				: bitsPerSample === 24
					? 'pcm-s24'
					: null;
	if (format === null) {
		throw new Error(`Unsupported bits per sample: ${bitsPerSample}`);
	}

	const wavHeader: WavFmt = {
		bitsPerSample,
		blockAlign,
		byteRate,
		numberOfChannels,
		sampleRate,
		type: 'wav-fmt',
	};

	state.structure.getWavStructure().boxes.push(wavHeader);

	if (audioFormat === 65534) {
		const extraSize = iterator.getUint16Le();
		if (extraSize !== 22) {
			throw new Error(
				`Only supporting WAVE with 22 extra bytes, but got ${extraSize} bytes extra size`,
			);
		}

		iterator.getUint16Le(); // valid bits per sample
		const channelMask = iterator.getUint32Le();
		const subFormat = iterator.getSlice(16);
		// check if same as [ 1, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113 ]
		if (subFormat.length !== 16) {
			throw new Error(
				`Only supporting WAVE with PCM audio format, but got ${subFormat.length}`,
			);
		}

		if (subformatIsPcm(subFormat)) {
			// is pcm
		} else if (subformatIsIeeeFloat(subFormat)) {
			// is ieee float
		} else {
			throw new Error(`Unsupported subformat: ${subFormat}`);
		}

		const channels = getChannelsFromMask(channelMask);
		wavHeader.numberOfChannels = channels.length;
	}

	await registerAudioTrack({
		track: {
			type: 'audio',
			codec: format,
			codecData: null,
			description: undefined,
			codecEnum: format,
			numberOfChannels,
			sampleRate,
			originalTimescale: 1_000_000,
			trackId: 0,
			startInSeconds: 0,
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
		},
		container: 'wav',
		registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
		tracks: state.callbacks.tracks,
		logLevel: state.logLevel,
		onAudioTrack: state.onAudioTrack,
	});

	box.expectNoMoreBytes();

	return Promise.resolve(null);
};
