import type {Tensor} from './tensor';

export type WhisperModelOutput = {
	sequences: Tensor;
	token_timestamps: Tensor;
};
