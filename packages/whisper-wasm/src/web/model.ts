import {
	HubertForCTC,
	UniSpeechForCTC,
	UniSpeechSatForCTC,
	Wav2Vec2BertForCTC,
	Wav2Vec2ForCTC,
	WavLMForCTC,
} from '@huggingface/transformers';
import {PretrainedMixin} from './pretrained-mixin';

const MODEL_FOR_CTC_MAPPING_NAMES = new Map([
	['wav2vec2', ['Wav2Vec2ForCTC', Wav2Vec2ForCTC]],
	['wav2vec2-bert', ['Wav2Vec2BertForCTC', Wav2Vec2BertForCTC]],
	['unispeech', ['UniSpeechForCTC', UniSpeechForCTC]],
	['unispeech-sat', ['UniSpeechSatForCTC', UniSpeechSatForCTC]],
	['wavlm', ['WavLMForCTC', WavLMForCTC]],
	['hubert', ['HubertForCTC', HubertForCTC]],
]);

export class AutoModelForCTC extends PretrainedMixin {
	static MODEL_CLASS_MAPPINGS = [MODEL_FOR_CTC_MAPPING_NAMES];
}
