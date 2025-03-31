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
