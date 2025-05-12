import type {Tensor} from '@huggingface/transformers';

export function prepareTensorForDecode(tensor: Tensor) {
	const {dims} = tensor;
	switch (dims.length) {
		case 1:
			return tensor.tolist();
		case 2:
			if (dims[0] !== 1) {
				throw new Error(
					'Unable to decode tensor with `batch size !== 1`. Use `tokenizer.batch_decode(...)` for batched inputs.',
				);
			}

			return tensor.tolist()[0];
		default:
			throw new Error(
				`Expected tensor to have 1-2 dimensions, got ${dims.length}.`,
			);
	}
}
