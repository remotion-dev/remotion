import type {Codec} from '../codec';
import type {AnyRemotionOption} from './option';

export const validAudioCodecs = ['pcm-16', 'aac', 'mp3', 'opus'] as const;

export type AudioCodec = (typeof validAudioCodecs)[number];

export const supportedAudioCodecs = {
	h264: ['aac', 'pcm-16', 'mp3'] as const,
	'h264-mkv': ['pcm-16', 'mp3'] as const,
	'h264-ts': ['pcm-16', 'aac'] as const,
	aac: ['aac', 'pcm-16'] as const,
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

export const defaultAudioCodecs: {
	[key in Codec]: {
		[k in 'compressed' | 'lossless']:
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

const cliFlag = 'audio-codec' as const;

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
				value: 'aac',
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
	description: () => (
		<>
			Set the format of the audio that is embedded in the video. Not all codec
			and audio codec combinations are supported and certain combinations
			require a certain file extension and container format. See{' '}
			<a href="https://www.remotion.dev/docs/encoding/#audio-codec">
				this table
			</a>{' '}
			to see possible combinations.
		</>
	),
	docLink: 'https://www.remotion.dev/docs/encoding/#audio-codec',
	name: 'Audio Codec',
	ssrName: 'audioCodec',
	type: 'aac' as AudioCodec,
} satisfies AnyRemotionOption<AudioCodec | null>;
