/// ///////////////////////////////////////////////

import {PreTrainedModel} from '@huggingface/transformers';

// Whisper models
export class WhisperPreTrainedModel extends PreTrainedModel {
	requires_attention_mask = false;
	main_input_name = 'input_features';
	forward_params = [
		'input_features',
		'attention_mask',
		'decoder_input_ids',
		'decoder_attention_mask',
		'past_key_values',
	];
}
