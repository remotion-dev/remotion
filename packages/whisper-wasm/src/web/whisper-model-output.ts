import type {ModelOutput, Tensor} from '@huggingface/transformers';

export type WhisperModelOutput = ModelOutput & {
	sequences: Tensor;
	token_timestamps: Tensor;
};
