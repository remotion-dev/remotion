import type {AudioCodec, supportedAudioCodec} from './audio-codec';
import type {Codec} from './codec';
import {validCodecs} from './codec';

export type FileExtension =
	| 'aac'
	| '3gp'
	| 'm4a'
	| 'm4b'
	| 'mpg'
	| 'mpeg'
	| 'mkv'
	| 'mp4'
	| 'gif'
	| 'hevc'
	| 'mp3'
	| 'mov'
	| 'mxf'
	| 'wav'
	| 'webm';

export const defaultFileExtensionMap: {
	[key in Codec]: {
		default: FileExtension;
		forAudioCodec: {
			[k in typeof supportedAudioCodec[key][number]]: {
				possible: FileExtension[];
				default: FileExtension;
			};
		};
	};
} = {
	'h264-mkv': {
		default: 'mkv',
		forAudioCodec: {
			'pcm-16': {possible: ['mkv'], default: 'mkv'},
		},
	},
	aac: {
		default: 'aac',
		forAudioCodec: {
			aac: {
				possible: ['aac', '3gp', 'm4a', 'm4b', 'mpg', 'mpeg'],
				default: 'aac',
			},
			'pcm-16': {
				possible: ['wav'],
				default: 'wav',
			},
		},
	},
	gif: {
		default: 'gif',
		forAudioCodec: {},
	},
	h264: {
		default: 'mp4',
		forAudioCodec: {
			'pcm-16': {possible: ['mkv'], default: 'mkv'},
			aac: {possible: ['mp4', 'mkv'], default: 'mp4'},
		},
	},
	h265: {
		default: 'mp4',
		forAudioCodec: {
			aac: {possible: ['mp4', 'mkv', 'hevc'], default: 'mp4'},
			'pcm-16': {possible: ['mkv'], default: 'mkv'},
		},
	},
	mp3: {
		default: 'mp3',
		forAudioCodec: {
			mp3: {possible: ['mp3'], default: 'mp3'},
			'pcm-16': {possible: ['wav'], default: 'wav'},
		},
	},
	prores: {
		default: 'mov',
		forAudioCodec: {
			aac: {possible: ['mov', 'mkv', 'mxf'], default: 'mov'},
			'pcm-16': {possible: ['mov', 'mkv', 'mxf'], default: 'mov'},
		},
	},
	vp8: {
		default: 'webm',
		forAudioCodec: {
			'pcm-16': {possible: ['mkv'], default: 'mkv'},
			opus: {possible: ['webm'], default: 'webm'},
		},
	},
	vp9: {
		default: 'webm',
		forAudioCodec: {
			'pcm-16': {possible: ['mkv'], default: 'mkv'},
			opus: {possible: ['webm'], default: 'webm'},
		},
	},
	wav: {
		default: 'wav',
		forAudioCodec: {
			'pcm-16': {possible: ['wav'], default: 'wav'},
		},
	},
};

export const getFileExtensionFromCodec = <T extends Codec>(
	codec: T,
	audioCodec: AudioCodec | null
) => {
	if (!validCodecs.includes(codec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', '
			)}, but got ${codec}`
		);
	}

	const map = defaultFileExtensionMap[
		codec
	] as typeof defaultFileExtensionMap[T];
	if (audioCodec === null) {
		return map.default;
	}

	const typedAudioCodec =
		audioCodec as keyof typeof defaultFileExtensionMap[Codec]['forAudioCodec'];

	if (!(typedAudioCodec in map.forAudioCodec)) {
		throw new Error(
			`Audio codec ${typedAudioCodec} is not supported for codec ${codec}`
		);
	}

	return map.forAudioCodec[audioCodec as typeof supportedAudioCodec[T][number]]
		.default;
};
