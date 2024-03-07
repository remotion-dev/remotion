import type {Codec} from './codec';
import type {supportedAudioCodecs} from './options/audio-codec';

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
	| 'ts'
	| 'webm';

export const defaultFileExtensionMap: {
	[key in Codec]: {
		default: FileExtension;
		forAudioCodec: {
			[k in (typeof supportedAudioCodecs)[key][number]]: {
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
			mp3: {possible: ['mkv'], default: 'mkv'},
		},
	},
	'h264-ts': {
		default: 'ts',
		forAudioCodec: {
			'pcm-16': {possible: ['ts'], default: 'ts'},
			aac: {possible: ['ts'], default: 'ts'},
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
			'pcm-16': {possible: ['mkv', 'mov'], default: 'mkv'},
			aac: {possible: ['mp4', 'mkv', 'mov'], default: 'mp4'},
			mp3: {possible: ['mp4', 'mkv', 'mov'], default: 'mp4'},
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
