// JS doesn't support mixins, so we define some reused functions here, and allow "this" to be passed in

import {decoderForward, encoderForward} from './pretrained-model';
import {pick} from './whisper-generation-config';

/**
 * Perform forward pass on the seq2seq model (both encoder and decoder).
 * @param {Object} self The seq2seq model object.
 * @param {Object} model_inputs The input object for the model containing encoder and decoder inputs.
 * @returns {Promise<Seq2SeqLMOutput>} Promise that resolves with the output of the seq2seq model.
 * @private
 */
export async function seq2seqForward(self: any, model_inputs: any) {
	let {encoder_outputs, input_ids, decoder_input_ids, ...other_decoder_inputs} =
		model_inputs;
	// Encode if needed
	if (!encoder_outputs) {
		const encoder_inputs = pick(model_inputs, self.sessions.model.inputNames);
		// Encoder outputs are not given, so we must compute them.
		encoder_outputs = (await encoderForward(self, encoder_inputs))
			.last_hidden_state;
	}

	other_decoder_inputs.input_ids = decoder_input_ids;
	other_decoder_inputs.encoder_hidden_states = encoder_outputs;

	if (
		self.sessions.decoder_model_merged.inputNames.includes(
			'encoder_attention_mask',
		)
	) {
		other_decoder_inputs.encoder_attention_mask = model_inputs.attention_mask;
	}

	const decoderResults = await decoderForward(self, other_decoder_inputs, true);

	return decoderResults;
}
