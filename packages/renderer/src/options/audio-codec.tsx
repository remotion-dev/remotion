import type {Codec} from '../codec';
import type {AnyRemotionOption} from './option';
import {separateAudioOption} from './separate-audio';

export const validAudioCodecs = ['pcm-16', 'aac', 'mp3', 'opus'] as const;

export type AudioCodec = (typeof validAudioCodecs)[number];

export const supportedAudioCodecs = {
	h264: ['aac', 'pcm-16', 'mp3'] as const,
	'h264-mkv': ['pcm-16', 'mp3'] as const,
	'h264-ts': ['pcm-16', 'aac'] as const,
	aac: ['aac', 'pcm-16'] as const,
	avi: [] as const,
	gif: [] as const,
	h265: ['aac', 'pcm-16'] as const,
	mp3: ['mp3', 'pcm-16'] as const,
	prores: ['aac', 'pcm-16'] as const,
	vp8: ['opus', 'pcm-16'] as const,
	vp9: ['opus', 'pcm-16'] as const,
	wav: ['pcm-16'] as const,
} as const;

const _satisfies: {[key in Codec]: readonly AudioCodec[]} =
	supportedAudioCodecs;
if (_satisfies) {
	// Just for type checking
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const audioCodecNames = [
	'pcm_s16le',
	'libfdk_aac',
	'libmp3lame',
	'libopus',
] as const;

type FfmpegAudioCodecName = (typeof audioCodecNames)[number];

export const mapAudioCodecToFfmpegAudioCodecName = (
	audioCodec: AudioCodec,
): FfmpegAudioCodecName => {
	if (audioCodec === 'aac') {
		return 'libfdk_aac';
	}

	if (audioCodec === 'mp3') {
		return 'libmp3lame';
	}

	if (audioCodec === 'opus') {
		return 'libopus';
	}

	if (audioCodec === 'pcm-16') {
		return 'pcm_s16le';
	}

	throw new Error('unknown audio codec: ' + audioCodec);
};

const cliFlag = 'audio-codec' as const;
const ssrName = 'audioCodec' as const;

export const defaultAudioCodecs: {
	[key in Codec]: {
		[_ in 'compressed' | 'lossless']:
			| (typeof supportedAudioCodecs)[key][number]
			| null;
	};
} = {
	'h264-mkv': {
		lossless: 'pcm-16',
		compressed: 'pcm-16',
	},
	'h264-ts': {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	aac: {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	gif: {
		lossless: null,
		compressed: null,
	},
	h264: {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	h265: {
		lossless: 'pcm-16',
		compressed: 'aac',
	},
	mp3: {
		lossless: 'pcm-16',
		compressed: 'mp3',
	},
	prores: {
		lossless: 'pcm-16',
		compressed: 'pcm-16',
	},
	vp8: {
		lossless: 'pcm-16',
		compressed: 'opus',
	},
	vp9: {
		lossless: 'pcm-16',
		compressed: 'opus',
	},
	wav: {
		lossless: 'pcm-16',
		compressed: 'pcm-16',
	},
};

const extensionMap = {
	aac: 'aac',
	mp3: 'mp3',
	opus: 'opus',
	'pcm-16': 'wav',
} as const;

export const getExtensionFromAudioCodec = (audioCodec: AudioCodec) => {
	if (extensionMap[audioCodec]) {
		return extensionMap[audioCodec];
	}

	throw new Error(`Unsupported audio codec: ${audioCodec}`);
};

export const resolveAudioCodec = ({
	codec,
	setting,
	preferLossless,
	separateAudioTo,
}: {
	setting: AudioCodec | null;
	codec: Codec;
	preferLossless: boolean;
	separateAudioTo: string | null;
}) => {
	let derivedFromSeparateAudioToExtension: AudioCodec | null = null;

	if (separateAudioTo) {
		const extension = separateAudioTo.split('.').pop();
		for (const [key, value] of Object.entries(extensionMap)) {
			if (value === extension) {
				derivedFromSeparateAudioToExtension = key as AudioCodec;
				if (
					!(supportedAudioCodecs[codec] as readonly string[]).includes(
						derivedFromSeparateAudioToExtension as string,
					) &&
					derivedFromSeparateAudioToExtension
				) {
					throw new Error(
						`The codec is ${codec} but the audio codec derived from --${
							separateAudioOption.cliFlag
						} is ${derivedFromSeparateAudioToExtension}. The only supported codecs are: ${supportedAudioCodecs[
							codec
						].join(', ')}`,
					);
				}
			}
		}
	}

	// Explanation: https://github.com/remotion-dev/remotion/issues/1647
	if (preferLossless) {
		const selected = getDefaultAudioCodec({codec, preferLossless});
		if (
			derivedFromSeparateAudioToExtension &&
			selected !== derivedFromSeparateAudioToExtension
		) {
			throw new Error(
				`The audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from the "Prefer lossless" option (${selected}). Remove any conflicting options.`,
			);
		}

		return selected;
	}

	if (setting === null) {
		if (derivedFromSeparateAudioToExtension) {
			return derivedFromSeparateAudioToExtension;
		}

		return getDefaultAudioCodec({codec, preferLossless});
	}

	if (
		derivedFromSeparateAudioToExtension !== setting &&
		derivedFromSeparateAudioToExtension
	) {
		throw new Error(
			`The audio codec derived from --${separateAudioOption.cliFlag} is ${derivedFromSeparateAudioToExtension}, but does not match the audio codec derived from your ${audioCodecOption.name} setting (${setting}). Remove any conflicting options.`,
		);
	}

	return setting;
};

export const getDefaultAudioCodec = ({
	codec,
	preferLossless,
}: {
	codec: Codec;
	preferLossless: boolean;
}): AudioCodec | null => {
	return defaultAudioCodecs[codec][preferLossless ? 'lossless' : 'compressed'];
};

let _audioCodec: AudioCodec | null = null;

export const audioCodecOption = {
	cliFlag,
	setConfig: (audioCodec) => {
		if (audioCodec === null) {
			_audioCodec = null;
			return;
		}

		if (!validAudioCodecs.includes(audioCodec)) {
			throw new Error(
				`Audio codec must be one of the following: ${validAudioCodecs.join(
					', ',
				)}, but got ${audioCodec}`,
			);
		}

		_audioCodec = audioCodec;
	},
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			const codec = commandLine[cliFlag];
			if (!validAudioCodecs.includes(commandLine[cliFlag] as AudioCodec)) {
				throw new Error(
					`Audio codec must be one of the following: ${validAudioCodecs.join(
						', ',
					)}, but got ${codec}`,
				);
			}

			return {
				source: 'cli',
				value: commandLine[cliFlag] as AudioCodec,
			};
		}

		if (_audioCodec !== null) {
			return {
				source: 'config',
				value: _audioCodec,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	description: () =>
		`Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.`,
	docLink: 'https://www.remotion.dev/docs/encoding/#audio-codec',
	name: 'Audio Codec',
	ssrName,
	type: 'aac' as AudioCodec,
} satisfies AnyRemotionOption<AudioCodec | null>;
