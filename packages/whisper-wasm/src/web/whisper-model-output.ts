import type {ModelOutput} from '@huggingface/transformers';
import type {Tensor} from './tensor';

export type WhisperModelOutput = ModelOutput & {
	sequences: Tensor;
	token_timestamps: Tensor;
};
