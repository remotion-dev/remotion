export const DB_NAME = 'whisper-wasm';
export const DB_VERSION = 1;
export const DB_OBJECT_STORE_NAME = 'models';

export const MODELS = [
	'tiny',
	'tiny.en',
	'base',
	'base.en',
	'small',
	'small.en',
] as const;

export type WhisperModel = (typeof MODELS)[number];

export const SIZES: {[key in WhisperModel]: number} = {
	tiny: 77691713,
	'tiny.en': 77704715,
	base: 147951465,
	'base.en': 147964211,
	small: 487601967,
	'small.en': 487614201,
};
