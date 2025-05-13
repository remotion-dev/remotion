/* eslint-disable @typescript-eslint/no-unused-vars */
import {Callable} from './callable';

export class StoppingCriteria extends Callable {
	/**
	 *
	 * @param {number[][]} _input_ids (`number[][]` of shape `(batch_size, sequence_length)`):
	 * Indices of input sequence tokens in the vocabulary.
	 * @param {number[][]} _scores scores (`number[][]` of shape `(batch_size, config.vocab_size)`):
	 * Prediction scores of a language modeling head. These can be scores for each vocabulary token before SoftMax
	 * or scores for each vocabulary token after SoftMax.
	 * @returns {boolean[]} A list of booleans indicating whether each sequence should be stopped.
	 */
	_call(_input_ids: number[][], _scores: number[][] | undefined) {
		throw Error('StoppingCriteria needs to be subclassed');
	}
}
/**
 * This class can be used to stop generation whenever the full generated number of tokens exceeds `max_length`.
 * Keep in mind for decoder-only type of transformers, this will include the initial prompted tokens.
 */
export class MaxLengthCriteria extends StoppingCriteria {
	max_length: number;
	max_position_embeddings: number | null;

	/**
	 *
	 * @param {number} max_length The maximum length that the output sequence can have in number of tokens.
	 * @param {number} [max_position_embeddings=null] The maximum model length, as defined by the model's `config.max_position_embeddings` attribute.
	 */
	constructor(
		max_length: number,
		max_position_embeddings: number | null = null,
	) {
		super();
		this.max_length = max_length;
		this.max_position_embeddings = max_position_embeddings;
	}

	_call(input_ids: number[][]) {
		return input_ids.map((ids) => ids.length >= this.max_length);
	}
}
