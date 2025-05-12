/* eslint-disable no-return-await */
/* eslint-disable new-cap */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-use-before-define */

import type {PretrainedOptions} from '@huggingface/transformers';
import {
	AutoModelForCTC,
	AutoModelForSpeechSeq2Seq,
	type PreTrainedModel,
	type Processor,
} from '@huggingface/transformers';

import {AutoProcessor} from './auto-processor.js';
import {AutoTokenizer} from './auto-tokenizer.js';
import {Callable} from './callable.js';
import {dispatchCallback} from './dispatch-callback.js';
import type {Dtype} from './dtype.js';
import {round} from './maths.js';
import {whisperModelConfig} from './model-config.js';
import {read_audio} from './read-audio.js';
import type {Tensor} from './tensor.js';
import {whisperProcessorConfig} from './whisper-config.js';
import type {WhisperModelOutput} from './whisper-model-output.js';
import type {WhisperTokenizer} from './whisper-tokenizer.js';

export type AsrChunk = {
	stride: number[];
	input_features: Tensor;
	is_last: boolean;
	tokens?: bigint[];
	token_timestamps?: number[];
};

/**
 * @typedef {string | RawImage | URL} ImageInput
 * @typedef {ImageInput|ImageInput[]} ImagePipelineInputs
 */

/**
 * Prepare audios for further tasks.
 * @param {AudioPipelineInputs} audios audios to prepare.
 * @param {number} sampling_rate sampling rate of the audios.
 * @returns {Promise<Float32Array[]>} The preprocessed audio data.
 * @private
 */
async function prepareAudios(audios: (string | URL)[], sampling_rate: number) {
	if (!Array.isArray(audios)) {
		audios = [audios];
	}

	return await Promise.all(
		audios.map((x) => {
			if (typeof x === 'string' || x instanceof URL) {
				return read_audio(x, sampling_rate);
			}

			return x;
		}),
	);
}

export class Pipeline extends Callable {
	task: string;
	model: PreTrainedModel;
	tokenizer: WhisperTokenizer;
	processor: Processor;

	constructor({
		task,
		model,
		tokenizer,
		processor,
	}: {
		task: string;
		model: PreTrainedModel;
		tokenizer: WhisperTokenizer;
		processor: Processor;
	}) {
		super();
		this.task = task;
		this.model = model;
		this.tokenizer = tokenizer;
		this.processor = processor;
	}

	/** @type {DisposeType} */
	async dispose() {
		await this.model.dispose();
	}
}

export class AutomaticSpeechRecognitionPipeline
	extends /** @type {new (options: TextAudioPipelineConstructorArgs) => AutomaticSpeechRecognitionPipelineType} */ Pipeline
{
	/** @type {AutomaticSpeechRecognitionPipelineCallback} */
	async _call(audio: (string | URL)[], kwargs = {}) {
		return this._call_whisper(audio, kwargs);
	}

	/**
	 * @type {AutomaticSpeechRecognitionPipelineCallback}
	 * @private
	 */
	async _call_whisper(
		audio: (string | URL)[],
		kwargs: {
			chunk_length_s?: number;
			stride_length_s?: number;
			force_full_sequences?: boolean;
			return_timestamps?: 'word' | boolean;
			num_frames?: number;
			return_token_timestamps?: boolean;
		},
	) {
		const return_timestamps = kwargs.return_timestamps ?? false;
		const chunk_length_s: number = kwargs.chunk_length_s ?? 0;
		const force_full_sequences = kwargs.force_full_sequences ?? false;
		let stride_length_s = kwargs.stride_length_s ?? null;

		const generation_config = {...kwargs};

		if (return_timestamps === 'word') {
			generation_config.return_token_timestamps = true;
			generation_config.return_timestamps = false; // Do not predict timestamp tokens
		}

		const time_precision =
			whisperProcessorConfig.chunk_length /
			whisperModelConfig.max_source_positions;
		const {hop_length} = whisperProcessorConfig;

		const {sampling_rate} = whisperProcessorConfig;
		const preparedAudios = await prepareAudios(audio, sampling_rate);

		const toReturn = [];
		for (const aud of preparedAudios) {
			/** @type {{stride: number[], input_features: Tensor, is_last: boolean, tokens?: bigint[], token_timestamps?: number[]}[]} */
			let chunks: AsrChunk[] = [];
			if (chunk_length_s > 0) {
				if (stride_length_s === null) {
					stride_length_s = chunk_length_s / 6;
				} else if (chunk_length_s <= stride_length_s) {
					throw Error(
						'`chunk_length_s` must be larger than `stride_length_s`.',
					);
				}

				// TODO support different stride_length_s (for left and right)

				const window = sampling_rate * chunk_length_s;
				const stride = sampling_rate * stride_length_s;
				const jump = window - 2 * stride;
				let offset = 0;

				// Create subarrays of audio with overlaps
				while (true) {
					const offset_end = offset + window;
					const subarr = aud.subarray(offset, offset_end);
					const feature = await this.processor._call(subarr);

					const is_first = offset === 0;
					const is_last = offset_end >= aud.length;
					chunks.push({
						stride: [
							subarr.length,
							is_first ? 0 : stride,
							is_last ? 0 : stride,
						],
						input_features: feature.input_features,
						is_last,
					});
					if (is_last) break;
					offset += jump;
				}
			} else {
				chunks = [
					{
						stride: [aud.length, 0, 0],
						input_features: (await this.processor._call(aud)).input_features,
						is_last: true,
					},
				];
			}

			// Generate for each set of input features
			for (const chunk of chunks) {
				generation_config.num_frames = Math.floor(chunk.stride[0] / hop_length);

				// NOTE: doing sequentially for now
				const data = (await this.model.generate({
					// @ts-expect-error
					inputs: chunk.input_features,
					...generation_config,
				})) as WhisperModelOutput | Tensor;

				// TODO: Right now we only get top beam
				if (return_timestamps === 'word') {
					chunk.tokens = (data as WhisperModelOutput).sequences.tolist()[0];
					chunk.token_timestamps = (data as WhisperModelOutput).token_timestamps
						.tolist()[0]
						.map((x: number) => round(x, 2));
				} else {
					// @ts-expect-error
					chunk.tokens = (data as Tensor)[0].tolist();
				}

				// convert stride to seconds
				chunk.stride = chunk.stride.map((x) => x / sampling_rate);
			}

			// Merge text chunks
			const [full_text, optional] = this.tokenizer._decode_asr(chunks, {
				// @ts-expect-error
				time_precision,
				return_timestamps: return_timestamps as boolean,
				force_full_sequences,
			});

			toReturn.push({text: full_text, ...optional});
		}

		return toReturn;
	}
}

const SUPPORTED_TASK = Object.freeze({
	tokenizer: AutoTokenizer,
	pipeline: AutomaticSpeechRecognitionPipeline,
	model: [AutoModelForSpeechSeq2Seq, AutoModelForCTC],
	processor: AutoProcessor,
	default: {
		model: 'onnx-community/whisper-base',
	},
	type: 'multimodal',
});

export async function pipeline(
	model: string | null,
	{
		progress_callback,
		config,
		cache_dir,
		local_files_only,
		revision,
		device,
		dtype,
		model_file_name,
		session_options,
	}: {
		dtype?: Dtype;
		progress_callback: (data: any) => void;
		config?: any;
		cache_dir?: string;
		local_files_only?: boolean;
		revision?: string;
		device?: 'webgpu';
		model_file_name?: string;
		session_options?: any;
	},
) {
	// Helper method to construct pipeline

	// Apply aliases

	// Get pipeline info
	const pipelineInfo = SUPPORTED_TASK;

	// Use model if specified, otherwise, use default
	if (!model) {
		model = pipelineInfo.default.model;
		console.log(`No model specified. Using default model: "${model}".`);
	}

	const pretrainedOptions = {
		progress_callback,
		config,
		cache_dir,
		local_files_only,
		revision,
		device,
		dtype,
		model_file_name,
		session_options,
	};

	// @ts-expect-error
	const classes = new Map([
		['tokenizer', pipelineInfo.tokenizer],
		['model', pipelineInfo.model],
		['processor', pipelineInfo.processor],
	]);

	// Load model, tokenizer, and processor (if they exist)
	const results = await loadItems({mapping: classes, model, pretrainedOptions});
	results.task = SUPPORTED_TASK;

	dispatchCallback(progress_callback, {
		status: 'ready',
	});

	const pipelineClass = pipelineInfo.pipeline;
	return new pipelineClass(results);
}

/**
 * Helper function to get applicable model, tokenizer, or processor classes for a given model.
 * @param {Map<string, any>} mapping The mapping of names to classes, arrays of classes, or null.
 * @param {string} model The name of the model to load.
 * @param {import('./utils/hub.js').PretrainedOptions} pretrainedOptions The options to pass to the `from_pretrained` method.
 * @private
 */
async function loadItems({
	mapping,
	model,
	pretrainedOptions,
}: {
	mapping: Map<string, any>;
	model: string;
	pretrainedOptions: PretrainedOptions;
}) {
	const result = Object.create(null);

	/** @type {Promise[]} */
	const promises = [];
	for (const [name, cls] of mapping.entries()) {
		if (!cls) continue;

		/** @type {Promise} */
		let promise;
		if (Array.isArray(cls)) {
			promise = new Promise(async (resolve, reject) => {
				let e;
				for (const c of cls) {
					if (c === null) {
						// If null, we resolve it immediately, meaning the relevant
						// class was not found, but it is optional.
						resolve(null);
						return;
					}

					try {
						resolve(await c.from_pretrained(model, pretrainedOptions));
						return;
					} catch (err) {
						if ((err as Error).message?.includes('Unsupported model type')) {
							// If the error is due to an unsupported model type, we
							// save the error and try the next class.
							e = err;
						} else if (
							(err as Error).message?.includes('Could not locate file')
						) {
							e = err;
						} else {
							reject(err);
							return;
						}
					}
				}

				reject(e);
			});
		} else {
			promise = cls.from_pretrained(model, pretrainedOptions);
		}

		result[name] = promise;
		promises.push(promise);
	}

	// Wait for all promises to resolve (in parallel)
	await Promise.all(promises);

	// Then assign to result
	for (const [name, promise] of Object.entries(result)) {
		result[name] = await promise;
	}

	return result;
}
