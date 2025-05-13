/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-eq-null */
/* eslint-disable no-console */
import type {StoppingCriteriaList} from '@huggingface/transformers';
import {SuppressTokensAtBeginLogitsProcessor} from '@huggingface/transformers';
import {dynamic_time_warping} from './dynamic-time-warping';
import {LogitsProcessorList} from './logits-processor-list';
import {medianFilter} from './median-filter';
import {mergeArrays} from './merge-arrays';
import {cat, stack} from './stack';
import {std_mean} from './std-mean';
import {mean, Tensor} from './tensor';
import {WhisperGenerationConfig} from './whisper-generation-config';
import {whisper_language_to_code} from './whisper-language-to-code';
import {WhisperPreTrainedModel} from './whisper-pretrained-model';
import {WhisperTimeStampLogitsProcessor} from './whisper-timestamp-logits-processor';

/**
 * WhisperForConditionalGeneration class for generating conditional outputs from Whisper models.
 */
export class WhisperForConditionalGeneration extends WhisperPreTrainedModel {
	// @ts-expect-error
	_prepare_generation_config(
		generation_config: WhisperGenerationConfig | null,
		kwargs: Record<string, unknown>,
	) {
		return /** @type {WhisperGenerationConfig} */ super._prepare_generation_config(
			generation_config as any,
			kwargs,
			// @ts-expect-error
			WhisperGenerationConfig,
		);
	}

	/**
	 *
	 * @param {WhisperGenerationConfig} generation_config
	 */
	_retrieve_init_tokens(generation_config: WhisperGenerationConfig) {
		// prefix tokens are of the form:
		//  - Multilingual: <|startoftranscript|> <|lang_id|> <|task|> [<|notimestamps|>]
		//  - English-only: <|startoftranscript|> [<|notimestamps|>]

		// 1. Handle <|startoftranscript|> token
		const init_tokens: number[] = [generation_config.decoder_start_token_id!];

		// 2. Handle <|lang_id|> and <|task> tokens
		let {language} = generation_config;
		const {task} = generation_config;
		if (generation_config.is_multilingual) {
			if (!language) {
				// TODO: Implement language detection
				console.warn('No language specified - defaulting to English (en).');
				language = 'en';
			}

			// Add language token
			const language_code = whisper_language_to_code(language);
			const language_token = `<|${language_code}|>`;
			init_tokens.push(generation_config.lang_to_id![language_token]);

			// Add task token
			// NOTE: Defaults to 'transcribe' if no task is specified
			init_tokens.push(generation_config.task_to_id![task ?? 'transcribe']);
		} else if (language || task) {
			throw new Error(
				'Cannot specify `task` or `language` for an English-only model. If the model is intended to be multilingual, pass `is_multilingual=true` to generate, or update the generation config.',
			);
		}

		// 3. Handle <|notimestamps|> token
		if (
			!generation_config.return_timestamps &&
			generation_config.no_timestamps_token_id &&
			init_tokens.at(-1) !== generation_config.no_timestamps_token_id
		) {
			init_tokens.push(generation_config.no_timestamps_token_id);
		} else if (
			generation_config.return_timestamps &&
			init_tokens.at(-1) === generation_config.no_timestamps_token_id
		) {
			console.warn(
				'<|notimestamps|> prompt token is removed from generation_config since `return_timestamps` is set to `true`.',
			);
			init_tokens.pop();
		}

		// let's make sure we don't pass `null` tokens as prompt tokens

		return init_tokens.filter((token) => token != null);
	}

	/**
	 * Transcribes or translates log-mel input features to a sequence of auto-regressively generated token ids.
	 * @param {import('./models/whisper/generation_whisper.js').WhisperGenerationFunctionParameters} options
	 * @returns {Promise<ModelOutput|Tensor>} The output of the model, which can contain the generated token ids, attentions, and scores.
	 */
	// @ts-expect-error
	async generate({
		inputs = null,
		// @ts-expect-error
		generation_config = null,
		logits_processor = null,
		stopping_criteria = null,

		// Whisper-specific options (passed to kwargs)
		// prompt_ids = null,
		// language = null,
		// task = null,

		...kwargs
	}: {
		inputs: Tensor | null;
		generation_config: WhisperGenerationConfig;
		logits_processor: LogitsProcessorList | null;
		stopping_criteria: StoppingCriteriaList | null;
		kwargs: Record<string, unknown>;
	}) {
		// @ts-expect-error
		generation_config = this._prepare_generation_config(
			generation_config,
			kwargs,
		);

		const init_tokens =
			// @ts-expect-error
			kwargs.decoder_input_ids ?? this._retrieve_init_tokens(generation_config);

		if (generation_config.return_timestamps) {
			logits_processor ??= new LogitsProcessorList();
			logits_processor.push(
				new WhisperTimeStampLogitsProcessor(generation_config, init_tokens),
			);
		}

		if (generation_config.begin_suppress_tokens) {
			logits_processor ??= new LogitsProcessorList();
			logits_processor.push(
				// @ts-expect-error
				new SuppressTokensAtBeginLogitsProcessor(
					generation_config.begin_suppress_tokens,
					init_tokens.length,
				),
			);
		}

		if (generation_config.return_token_timestamps) {
			if (!generation_config.alignment_heads) {
				throw new Error(
					'Model generation config has no `alignment_heads`, token-level timestamps not available. ' +
						'See https://gist.github.com/hollance/42e32852f24243b748ae6bc1f985b13a on how to add this property to the generation config.',
				);
			}

			if (generation_config.task === 'translate') {
				console.warn(
					"Token-level timestamps may not be reliable for task 'translate'.",
				);
			}

			generation_config.output_attentions = true;
			generation_config.return_dict_in_generate = true;
		}

		const outputs = await super.generate({
			// @ts-expect-error
			inputs,
			// @ts-expect-error
			generation_config,
			// @ts-expect-error
			logits_processor,
			decoder_input_ids: init_tokens,
			...kwargs,
		});

		if (generation_config.return_token_timestamps) {
			// @ts-expect-error
			outputs.token_timestamps = this._extract_token_timestamps(
				// @ts-expect-error
				outputs,
				generation_config.alignment_heads,
				generation_config.num_frames,
				undefined,
			);
		}

		return outputs;
	}

	/**
	 * Calculates token-level timestamps using the encoder-decoder cross-attentions and
	 * dynamic time-warping (DTW) to map each output token to a position in the input audio.
	 * If `num_frames` is specified, the encoder-decoder cross-attentions will be cropped before applying DTW.
	 * @param {Object} generate_outputs Outputs generated by the model
	 * @param {Tensor[][]} generate_outputs.cross_attentions The cross attentions output by the model
	 * @param {Tensor} generate_outputs.sequences The sequences output by the model
	 * @param {number[][]} alignment_heads Alignment heads of the model
	 * @param {number} [num_frames=null] Number of frames in the input audio.
	 * @param {number} [time_precision=0.02] Precision of the timestamps in seconds
	 * @returns {Tensor} tensor containing the timestamps in seconds for each predicted token
	 */
	_extract_token_timestamps(
		generate_outputs: {
			cross_attentions: Tensor[][];
			sequences: Tensor;
		},
		alignment_heads: number[][],
		num_frames: number | null,
		time_precision: number,
	) {
		if (!generate_outputs.cross_attentions) {
			throw new Error(
				'Model outputs must contain cross attentions to extract timestamps. ' +
					'This is most likely because the model was not exported with `output_attentions=True`.',
			);
		}

		if (num_frames == null) {
			console.warn(
				'`num_frames` has not been set, meaning the entire audio will be analyzed. ' +
					'This may lead to inaccurate token-level timestamps for short audios (< 30 seconds).',
			);
		}

		// @ts-expect-error TS2339
		let {median_filter_width} = this.config;
		if (median_filter_width === undefined) {
			console.warn(
				'Model config has no `median_filter_width`, using default value of 7.',
			);
			median_filter_width = 7;
		}

		// TODO: Improve batch processing
		const batch = generate_outputs.cross_attentions;
		// Create a list with `decoder_layers` elements, each a tensor of shape
		// (batch size, attention_heads, output length, input length).
		const cross_attentions = Array.from(
			// @ts-expect-error
			{length: this.config.decoder_layers},
			// Concatenate the cross attentions for each layer across sequence length dimension.
			(_, i) =>
				cat(
					batch.map((x) => x[i]),
					2,
				),
		);

		const weights = stack(
			alignment_heads.map(([l, h]) => {
				if (l >= cross_attentions.length) {
					throw new Error(
						`Layer index ${l} is out of bounds for cross attentions (length ${cross_attentions.length}).`,
					);
				}

				return num_frames
					? cross_attentions[l].slice(null, h, null, [0, num_frames])
					: cross_attentions[l].slice(null, h);
			}),
		).transpose(1, 0, 2, 3);

		const [std, calculatedMean] = std_mean(weights, -2, 0, true);

		// Normalize and smoothen the weights.
		const smoothedWeights = weights.clone(); // [1, 8, seqLength, 1500]

		for (let a = 0; a < smoothedWeights.dims[0]; ++a) {
			// @ts-expect-error
			const aTensor = smoothedWeights[a]; // [8, seqLength, 1500]

			for (let b = 0; b < aTensor.dims[0]; ++b) {
				const bTensor = aTensor[b]; // [seqLength, 1500]
				// @ts-expect-error
				const stdTensorData = std[a][b][0].data; // [1500]
				// @ts-expect-error
				const meanTensorData = calculatedMean[a][b][0].data; // [1500]

				for (let c = 0; c < bTensor.dims[0]; ++c) {
					const cTensorData = bTensor[c].data; // [1500]
					for (let d = 0; d < cTensorData.length; ++d) {
						cTensorData[d] =
							(cTensorData[d] - meanTensorData[d]) / stdTensorData[d];
					}

					// Apply median filter.
					cTensorData.set(medianFilter(cTensorData, median_filter_width));
				}
			}
		}

		// Average the different cross-attention heads.
		const batchedMatrices = [mean(smoothedWeights, 1)];

		const timestampsShape = generate_outputs.sequences.dims;

		const timestamps = new Tensor(
			'float32',
			new Float32Array(timestampsShape[0] * timestampsShape[1]),
			timestampsShape,
		);

		// Perform dynamic time warping on each element of the batch.
		for (let batch_idx = 0; batch_idx < timestampsShape[0]; ++batch_idx) {
			// NOTE: Since we run only one batch at a time, we can squeeze to get the same dimensions
			// as the python implementation
			const matrix = batchedMatrices[batch_idx].neg().squeeze_(0);
			const [text_indices, time_indices] = dynamic_time_warping(
				matrix.tolist(),
			);

			const diffs = Array.from(
				{length: text_indices.length - 1},
				(_v, i) => text_indices[i + 1] - text_indices[i],
			);
			const jumps = mergeArrays([1], diffs).map((x) => Boolean(x)); // convert to boolean

			const jump_times = [];
			for (let i = 0; i < jumps.length; ++i) {
				if (jumps[i]) {
					// NOTE: No point in rounding here, since we set to Float32Array later
					jump_times.push(time_indices[i] * time_precision);
				}
			}

			// @ts-expect-error
			timestamps[batch_idx].data.set(jump_times, 1);
		}

		return timestamps;
	}
}
