/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unreachable-loop */
import {Callable} from './callable';
import {generationConfig} from './generation-config';
import {getKeyValueShapes} from './get-key-value-shapes';
import {getModelFile} from './get-model-file';
import {LogitsProcessorList} from './logits-processor-list';
import {LogitsSampler} from './logits-sampler';
import {MaxLengthCriteria} from './max-length-criteria';
import {sessionRun} from './models';
import {
	createInferenceSession,
	deviceToExecutionProviders,
	IS_WEBGPU_AVAILABLE,
	isONNXProxy,
} from './onnx';
import {AutoConfig, type PretrainedConfig} from './pretrained-config';
import {seq2seqForward} from './seq2seq-forward';
import {cat} from './stack';
import {StoppingCriteriaList} from './stopping-criteria-list';
import {SuppressTokensAtBeginLogitsProcessor} from './suppress-tokens-at-begin';
import {
	DataTypeMap,
	full_like,
	ones,
	ones_like,
	Tensor,
	toI64Tensor,
	zeros_like,
} from './tensor';
import {TopKLogitsWarper} from './top-k-logits-warper';
import type {GenerationConfig} from './whisper-generation-config';
import {pick, WhisperGenerationConfig} from './whisper-generation-config';

export const DATA_TYPES = Object.freeze({
	auto: 'auto', // Auto-detect based on environment
	fp32: 'fp32',
	fp16: 'fp16',
	q8: 'q8',
	int8: 'int8',
	uint8: 'uint8',
	q4: 'q4',
	bnb4: 'bnb4',
	q4f16: 'q4f16', // fp16 model with int4 block weight quantization
});

const DEFAULT_DTYPE_SUFFIX_MAPPING = Object.freeze({
	[DATA_TYPES.fp32]: '',
	[DATA_TYPES.fp16]: '_fp16',
	[DATA_TYPES.int8]: '_int8',
	[DATA_TYPES.uint8]: '_uint8',
	[DATA_TYPES.q8]: '_quantized',
	[DATA_TYPES.q4]: '_q4',
	[DATA_TYPES.q4f16]: '_q4f16',
	[DATA_TYPES.bnb4]: '_bnb4',
});

const MODEL_TYPES = {
	EncoderOnly: 0,
	EncoderDecoder: 1,
	Seq2Seq: 2,
	Vision2Seq: 3,
	DecoderOnly: 4,
	MaskGeneration: 5,
	ImageTextToText: 6,
	Musicgen: 7,
	MultiModality: 8,
	Phi3V: 9,
	AudioTextToText: 10,
	AutoEncoder: 11,
};

export const DEVICE_TYPES = Object.freeze({
	auto: 'auto', // Auto-detect based on device and environment
	gpu: 'gpu', // Auto-detect GPU
	cpu: 'cpu', // CPU
	wasm: 'wasm', // WebAssembly
	webgpu: 'webgpu', // WebGPU
	cuda: 'cuda', // CUDA
	dml: 'dml', // DirectML

	webnn: 'webnn', // WebNN (default)
	'webnn-npu': 'webnn-npu', // WebNN NPU
	'webnn-gpu': 'webnn-gpu', // WebNN GPU
	'webnn-cpu': 'webnn-cpu', // WebNN CPU
});

export const DEFAULT_DEVICE_DTYPE_MAPPING = Object.freeze({
	// NOTE: If not specified, will default to fp32
	[DEVICE_TYPES.wasm]: DATA_TYPES.q8,
});

function encoder_decoder_prepare_inputs_for_generation(
	_self: any,
	input_ids: any,
	model_inputs: any,
) {
	if (model_inputs.past_key_values) {
		input_ids = input_ids.map((x: any) => [x.at(-1)]);
	}

	return {
		...model_inputs,
		decoder_input_ids: toI64Tensor(input_ids),
	};
}

export const isWebGpuFp16Supported = (function () {
	/** @type {boolean} */
	let cachedResult: boolean;

	return async function () {
		if (cachedResult === undefined) {
			if (!IS_WEBGPU_AVAILABLE) {
				cachedResult = false;
			} else {
				try {
					// @ts-expect-error
					const adapter = await navigator.gpu.requestAdapter();
					cachedResult = adapter.features.has('shader-f16');
				} catch {
					cachedResult = false;
				}
			}
		}

		return cachedResult;
	};
})();

export const MAX_EXTERNAL_DATA_CHUNKS = 100;

function boolTensor(value: boolean) {
	return new Tensor('bool', [value], [1]);
}

/**
 * Helper function to perform the following:
 * ```python
 * x = attention_mask.long().cumsum(-1) - 1
 * x.masked_fill_(attention_mask == 0, 1)
 * ```
 * @param {Tensor} attention_mask
 * @returns {{data: BigInt64Array, dims: number[]}}
 */
function cumsum_masked_fill(attention_mask: Tensor, start_index = 0) {
	const [bz, seq_len] = attention_mask.dims;
	const attn_mask_data = attention_mask.data;

	const data = new BigInt64Array(attn_mask_data.length);
	for (let i = 0; i < bz; ++i) {
		const start = i * seq_len;
		let sum = BigInt(start_index);
		for (let j = 0; j < seq_len; ++j) {
			const index = start + j;
			if (attn_mask_data[index] === BigInt(0)) {
				data[index] = BigInt(1);
			} else {
				// === 1n
				data[index] = sum;
				sum += attn_mask_data[index];
			}
		}
	}

	return {data, dims: attention_mask.dims};
}

function createPositionIds(
	model_inputs: any,
	past_key_values = null,
	start_index = 0,
) {
	const {input_ids, inputs_embeds, attention_mask} = model_inputs;

	const {data, dims} = cumsum_masked_fill(attention_mask, start_index);
	let position_ids = new Tensor('int64', data, dims);
	if (past_key_values) {
		const offset = -(input_ids ?? inputs_embeds).dims.at(1);
		// @ts-expect-error
		position_ids = position_ids.slice(null, [offset, null]);
	}

	return position_ids;
}

/**
 * Forward pass of a decoder model.
 * @param {Object} self The decoder model.
 * @param {Object} model_inputs The input data to be used for the forward pass.
 * @returns {Promise<Object>} The logits and past key values.
 * @private
 */
export async function decoderForward(
	self: any,
	model_inputs: any,
	is_encoder_decoder = false,
) {
	const session =
		self.sessions[is_encoder_decoder ? 'decoder_model_merged' : 'model'];

	const {past_key_values, ...new_model_inputs} = model_inputs;

	if (session.inputNames.includes('use_cache_branch')) {
		new_model_inputs.use_cache_branch = boolTensor(Boolean(past_key_values));
	}

	if (
		session.inputNames.includes('position_ids') &&
		new_model_inputs.attention_mask &&
		!new_model_inputs.position_ids
	) {
		// NOTE: Handle a special case for paligemma/gemma3 models, where positions are 1-indexed
		const start_index = ['paligemma', 'gemma3_text', 'gemma3'].includes(
			self.config.model_type,
		)
			? 1
			: 0;
		new_model_inputs.position_ids = createPositionIds(
			new_model_inputs,
			past_key_values,
			start_index,
		);
	}

	// Unpack the `past_key_values` object into model inputs
	self.addPastKeyValues(new_model_inputs, past_key_values);

	// Select only the inputs that are needed for the current session
	const fixed = pick(new_model_inputs, session.inputNames);
	return sessionRun(session, fixed);
}

/**
 * Forward pass of an encoder model.
 * @param {Object} self The encoder model.
 * @param {Object} model_inputs The input data to be used for the forward pass.
 * @returns {Promise<Object>} The model's outputs.
 * @private
 */
export async function encoderForward(self: any, model_inputs: any) {
	const session = self.sessions.model;
	const encoderFeeds = pick(model_inputs, session.inputNames);

	if (
		session.inputNames.includes('inputs_embeds') &&
		!encoderFeeds.inputs_embeds
	) {
		if (!model_inputs.input_ids) {
			throw new Error(
				'Both `input_ids` and `inputs_embeds` are missing in the model inputs.',
			);
		}

		encoderFeeds.inputs_embeds = await self.encode_text({
			input_ids: model_inputs.input_ids,
		});
	}

	if (
		session.inputNames.includes('token_type_ids') &&
		!encoderFeeds.token_type_ids
	) {
		if (!encoderFeeds.input_ids) {
			throw new Error(
				'Both `input_ids` and `token_type_ids` are missing in the model inputs.',
			);
		}

		// Assign default `token_type_ids` (all zeroes) to the `encoderFeeds` if the model expects it,
		// but they weren't created by the tokenizer.
		encoderFeeds.token_type_ids = zeros_like(encoderFeeds.input_ids);
	}

	if (session.inputNames.includes('pixel_mask') && !encoderFeeds.pixel_mask) {
		if (!encoderFeeds.pixel_values) {
			throw new Error(
				'Both `pixel_values` and `pixel_mask` are missing in the model inputs.',
			);
		}

		// Assign default `pixel_mask` (all ones) to the `encoderFeeds` if the model expects it,
		// but they weren't created by the processor.
		const {dims} = encoderFeeds.pixel_values;
		encoderFeeds.pixel_mask = ones([dims[0], dims[2], dims[3]]);
	}

	return sessionRun(session, encoderFeeds);
}

/**
 * Constructs an InferenceSession using a model file located at the specified path.
 * @param {string} pretrained_model_name_or_path The path to the directory containing the model file.
 * @param {string} fileName The name of the model file.
 * @param {import('./utils/hub.js').PretrainedModelOptions} options Additional options for loading the model.
 * @returns {Promise<{buffer_or_path: Uint8Array|string, session_options: Object, session_config: Object}>} A Promise that resolves to the data needed to create an InferenceSession object.
 * @private
 */
async function getSession(
	pretrained_model_name_or_path: string,
	fileName: string,
	options: any,
) {
	let custom_config = options.config?.['transformers.js_config'] ?? {};

	let device = options.device ?? custom_config.device;
	if (device && typeof device !== 'string') {
		if (device.hasOwnProperty(fileName)) {
			device = device[fileName];
		} else {
			// eslint-disable-next-line no-console
			console.warn(
				`device not specified for "${fileName}". Using the default device.`,
			);
			device = null;
		}
	}

	// If the device is not specified, we use the default (supported) execution providers.
	const selectedDevice =
		/** @type {import("./utils/devices.js").DeviceType} */ device ?? 'wasm';

	const executionProviders = deviceToExecutionProviders(selectedDevice);

	// Update custom config with the selected device's config, if it exists
	const device_config = custom_config.device_config ?? {};
	if (device_config.hasOwnProperty(selectedDevice)) {
		custom_config = {
			...custom_config,
			...device_config[selectedDevice],
		};
	}

	// If options.dtype is specified, we use it to choose the suffix for the model file.
	// Otherwise, we use the default dtype for the device.
	let dtype = options.dtype ?? custom_config.dtype;
	if (typeof dtype !== 'string') {
		if (dtype && dtype.hasOwnProperty(fileName)) {
			dtype = dtype[fileName];
		} else {
			dtype =
				DEFAULT_DEVICE_DTYPE_MAPPING[
					selectedDevice as keyof typeof DEFAULT_DEVICE_DTYPE_MAPPING
				] ?? DATA_TYPES.fp32;
			// eslint-disable-next-line no-console
			console.warn(
				`dtype not specified for "${fileName}". Using the default dtype (${dtype}) for this device (${selectedDevice}).`,
			);
		}
	}

	const selectedDtype =
		/** @type {import("./utils/dtypes.js").DataType} */ dtype;

	if (!DEFAULT_DTYPE_SUFFIX_MAPPING.hasOwnProperty(selectedDtype)) {
		throw new Error(
			`Invalid dtype: ${selectedDtype}. Should be one of: ${Object.keys(DATA_TYPES).join(', ')}`,
		);
	} else if (
		selectedDtype === DATA_TYPES.fp16 &&
		selectedDevice === 'webgpu' &&
		!(await isWebGpuFp16Supported())
	) {
		throw new Error(`The device (${selectedDevice}) does not support fp16.`);
	}

	// Only valid for models with a decoder
	const kv_cache_dtype_config = custom_config.kv_cache_dtype;
	const kv_cache_dtype = kv_cache_dtype_config
		? typeof kv_cache_dtype_config === 'string'
			? kv_cache_dtype_config
			: (kv_cache_dtype_config[selectedDtype] ?? 'float32')
		: undefined;

	if (kv_cache_dtype && !['float32', 'float16'].includes(kv_cache_dtype)) {
		throw new Error(
			`Invalid kv_cache_dtype: ${kv_cache_dtype}. Should be one of: float32, float16`,
		);
	}

	const session_config = {
		dtype: selectedDtype,
		kv_cache_dtype,
		device: selectedDevice,
	};

	// Construct the model file name
	const suffix =
		DEFAULT_DTYPE_SUFFIX_MAPPING[
			selectedDtype as keyof typeof DEFAULT_DTYPE_SUFFIX_MAPPING
		];
	const baseName = `${fileName}${suffix}.onnx`;

	const session_options = {...options.session_options};

	// Overwrite `executionProviders` if not specified
	session_options.executionProviders ??= executionProviders;

	// Overwrite `freeDimensionOverrides` if specified in config and not set in session options
	const {free_dimension_overrides} = custom_config;
	if (free_dimension_overrides) {
		session_options.freeDimensionOverrides ??= free_dimension_overrides;
	} else if (
		selectedDevice.startsWith('webnn') &&
		!session_options.freeDimensionOverrides
	) {
		// eslint-disable-next-line no-console
		console.warn(
			`WebNN does not currently support dynamic shapes and requires 'free_dimension_overrides' to be set in config.json, preferably as a field within config["transformers.js_config"]["device_config"]["${selectedDevice}"]. ` +
				`When 'free_dimension_overrides' is not set, you may experience significant performance degradation.`,
		);
	}

	const modelFileName = `${options.subfolder ?? ''}/${baseName}`;

	const bufferOrPathPromise = getModelFile(
		pretrained_model_name_or_path,
		modelFileName,
	);

	// Handle onnx external data files
	const use_external_data_format =
		options.use_external_data_format ?? custom_config.use_external_data_format;
	/** @type {Promise<string|{path: string, data: Uint8Array}>[]} */
	let externalDataPromises = [];
	if (use_external_data_format) {
		let external_data_format;
		if (typeof use_external_data_format === 'object') {
			if (use_external_data_format.hasOwnProperty(baseName)) {
				external_data_format = use_external_data_format[baseName];
			} else if (use_external_data_format.hasOwnProperty(fileName)) {
				external_data_format = use_external_data_format[fileName];
			} else {
				external_data_format = false;
			}
		} else {
			external_data_format = use_external_data_format;
		}

		const num_chunks = Number(external_data_format); // (false=0, true=1, number remains the same)
		if (num_chunks > MAX_EXTERNAL_DATA_CHUNKS) {
			throw new Error(
				`The number of external data chunks (${num_chunks}) exceeds the maximum allowed value (${MAX_EXTERNAL_DATA_CHUNKS}).`,
			);
		}

		for (let i = 0; i < num_chunks; ++i) {
			const path = `${baseName}_data${i === 0 ? '' : '_' + i}`;
			externalDataPromises.push(
				// eslint-disable-next-line no-async-promise-executor
				new Promise(async (resolve) => {
					const fullPath = `${options.subfolder ?? ''}/${path}`;

					const data = await getModelFile(
						pretrained_model_name_or_path,
						fullPath,
					);
					resolve(data instanceof Uint8Array ? {path, data} : path);
				}),
			);
		}
	} else if (session_options.externalData !== undefined) {
		externalDataPromises = session_options.externalData.map(
			async (ext: any) => {
				// if the external data is a string, fetch the file and replace the string with its content
				if (typeof ext.data === 'string') {
					const ext_buffer = await getModelFile(
						pretrained_model_name_or_path,
						ext.data,
					);
					return {...ext, data: ext_buffer};
				}

				return ext;
			},
		);
	}

	if (externalDataPromises.length > 0) {
		const externalData = await Promise.all(externalDataPromises);
		session_options.externalData = externalData;
	}

	if (selectedDevice === 'webgpu') {
		const shapes = getKeyValueShapes(options.config, {
			prefix: 'present',
		});
		if (Object.keys(shapes).length > 0 && !isONNXProxy()) {
			// Only set preferredOutputLocation if shapes are present and we aren't proxying ONNX
			const preferredOutputLocation: Record<string, string> = {};
			for (const key in shapes) {
				preferredOutputLocation[key] = 'gpu-buffer';
			}

			session_options.preferredOutputLocation = preferredOutputLocation;
		}
	}

	const buffer_or_path = await bufferOrPathPromise;

	return {buffer_or_path, session_options, session_config};
}

async function constructSessions(
	pretrained_model_name_or_path: string,
	names: Record<string, string>,
	options: any,
) {
	return Object.fromEntries(
		await Promise.all(
			Object.keys(names).map(async (name) => {
				const {buffer_or_path, session_options, session_config} =
					await getSession(pretrained_model_name_or_path, names[name], options);
				const session = await createInferenceSession(
					buffer_or_path,
					session_options,
					session_config,
				);
				return [name, session];
			}),
		),
	);
}

async function getOptionalConfigs(names: Record<string, string>) {
	return Object.fromEntries(
		await Promise.all(
			Object.keys(names).map(async (name) => {
				const config = generationConfig;
				return [name, config];
			}),
		),
	);
}

/**
 * A base class for pre-trained models that provides the model configuration and an ONNX session.
 */
export class PreTrainedModel extends Callable {
	main_input_name: string = 'input_ids';
	forward_params: string[] = ['input_ids', 'attention_mask'];
	config: PretrainedConfig;
	sessions: Record<string, any>;
	configs: Record<string, any>;
	can_generate: boolean;
	_forward:
		| ((model: PreTrainedModel, inputs: Record<string, any>) => Promise<any>)
		| null;

	_prepare_inputs_for_generation:
		| ((model: PreTrainedModel, ...args: any[]) => any)
		| null;

	custom_config: any;

	/**
	 * Creates a new instance of the `PreTrainedModel` class.
	 * @param {PretrainedConfig} config The model configuration.
	 * @param {Record<string, any>} sessions The inference sessions for the model.
	 * @param {Record<string, Object>} configs Additional configuration files (e.g., generation_config.json).
	 */
	constructor(
		config: PretrainedConfig,
		sessions: Record<string, any>,
		configs: Record<string, any>,
	) {
		super();

		this.config = config;
		this.sessions = sessions;
		this.configs = configs;

		const modelType = MODEL_TYPES.Seq2Seq;

		this.can_generate = false;
		this._forward = null;

		this._prepare_inputs_for_generation = null;
		switch (modelType) {
			case MODEL_TYPES.Seq2Seq:
				this.can_generate = true;

				this._forward = seq2seqForward;
				this._prepare_inputs_for_generation =
					encoder_decoder_prepare_inputs_for_generation;
				break;
			case MODEL_TYPES.DecoderOnly:
			case MODEL_TYPES.Vision2Seq:
			case MODEL_TYPES.Musicgen:
			case MODEL_TYPES.EncoderDecoder:
			case MODEL_TYPES.ImageTextToText:
			case MODEL_TYPES.AudioTextToText:
			case MODEL_TYPES.Phi3V:
			case MODEL_TYPES.MultiModality:
			case MODEL_TYPES.AutoEncoder:
			default:
				throw new Error('expecged not this');
		}
	}

	/**
	 * Disposes of all the ONNX sessions that were created during inference.
	 * @returns {Promise<unknown[]>} An array of promises, one for each ONNX session that is being disposed.
	 * @todo Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
	 */
	async dispose(): Promise<unknown[]> {
		const promises: Promise<unknown>[] = [];
		for (const session of Object.values(this.sessions)) {
			if (session?.handler?.dispose) {
				promises.push(session.handler.dispose());
			}
		}

		return Promise.all(promises);
	}

	/**
	 * Instantiate one of the model classes of the library from a pretrained model.
	 *
	 * The model class to instantiate is selected based on the `model_type` property of the config object
	 * (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
	 *
	 * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
	 * - A string, the *model id* of a pretrained model hosted inside a model repo on huggingface.co.
	 *   Valid model ids can be located at the root-level, like `bert-base-uncased`, or namespaced under a
	 *   user or organization name, like `dbmdz/bert-base-german-cased`.
	 * - A path to a *directory* containing model weights, e.g., `./my_model_directory/`.
	 * @param {PretrainedModelOptions} options Additional options for loading the model.
	 *
	 * @returns {Promise<PreTrainedModel>} A new instance of the `PreTrainedModel` class.
	 */
	static async from_pretrained(
		pretrained_model_name_or_path: string,
		{
			progress_callback = null,
			config = null,
			cache_dir = null,
			local_files_only = false,
			revision = 'main',
			model_file_name = null,
			subfolder = 'onnx',
			device = null,
			dtype = null,
			use_external_data_format = null,
			session_options = {},
		}: any = {},
	): Promise<PreTrainedModel> {
		const options = {
			progress_callback,
			config,
			cache_dir,
			local_files_only,
			revision,
			model_file_name,
			subfolder,
			device,
			dtype,
			use_external_data_format,
			session_options,
		};

		const modelType = MODEL_TYPES.Seq2Seq;

		// eslint-disable-next-line no-multi-assign
		config = options.config = await AutoConfig.from_pretrained(
			pretrained_model_name_or_path,
			options,
		);

		let info;
		if (modelType === MODEL_TYPES.Seq2Seq) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: 'encoder_model',
						decoder_model_merged: 'decoder_model_merged',
					},
					options,
				),
				getOptionalConfigs({
					generation_config: 'generation_config.json',
				}),
			]);
		}

		// @ts-expect-error
		return new this(config, ...info);
	}

	/**
	 * Runs the model with the provided inputs
	 * @param {Record<string, any>} model_inputs Object containing input tensors
	 * @returns {Promise<ModelOutput>} Object containing output tensors
	 */
	async _call(model_inputs: Record<string, any>): Promise<any> {
		return this.forward(model_inputs);
	}

	/**
	 * Forward method for a pretrained model. If not overridden by a subclass, the correct forward method
	 * will be chosen based on the model type.
	 * @param {Record<string, any>} model_inputs The input data to the model in the format specified in the ONNX model.
	 * @returns {Promise<ModelOutput>} The output data from the model in the format specified in the ONNX model.
	 * @throws {Error} This method must be implemented in subclasses.
	 */
	async forward(model_inputs: Record<string, any>): Promise<any> {
		return this._forward!(this, model_inputs);
	}

	/**
	 * Get the model's generation config, if it exists.
	 * @returns {GenerationConfig|null} The model's generation config if it exists, otherwise `null`.
	 */
	get generation_config(): GenerationConfig | null {
		return this.configs?.generation_config ?? null;
	}

	/**
	 * This function returns a [`LogitsProcessorList`] list object that contains all relevant [`LogitsWarper`]
	 * instances used for multinomial sampling.
	 * @param {GenerationConfig} generation_config The generation config.
	 * @returns {LogitsProcessorList} generation_config
	 */
	_get_logits_warper(generation_config: GenerationConfig): LogitsProcessorList {
		// instantiate warpers list
		const warpers = new LogitsProcessorList();

		if (generation_config.top_k !== null && generation_config.top_k !== 0) {
			// TODO: add min_tokens_to_keep
			warpers.push(new TopKLogitsWarper(generation_config.top_k));
		}

		return warpers;
	}

	/**
	 * @param {GenerationConfig} generation_config
	 * @param {number} input_ids_seq_length The starting sequence length for the input ids.
	 * @returns {LogitsProcessorList}
	 * @private
	 */
	_get_logits_processor(
		generation_config: GenerationConfig,
		input_ids_seq_length: number,
		// encoder_input_ids, TODO
		// prefix_allowed_tokens_fn, TODO
		logits_processor: LogitsProcessorList | null = null,
	): LogitsProcessorList {
		const processors = new LogitsProcessorList();

		// if (generation_config.diversity_penalty !== null && generation_config.diversity_penalty > 0.0) {
		//     processors.push(new HammingDiversityLogitsProcessor(
		//         generation_config.diversity_penalty,
		//         generation_config.num_beams,
		//         generation_config.num_beam_groups
		//     ));
		// }

		// if (generation_config.encoder_repetition_penalty !== null && generation_config.encoder_repetition_penalty !== 1.0) {
		//     processors.push(new EncoderRepetitionPenaltyLogitsProcessor(
		//         generation_config.encoder_repetition_penalty,
		//         encoder_input_ids
		//     ));
		// }

		// if (generation_config.encoder_no_repeat_ngram_size !== null && generation_config.encoder_no_repeat_ngram_size > 0) {
		//     if (this.config.is_encoder_decoder) {
		//         processors.push(new EncoderNoRepeatNGramLogitsProcessor(
		//             generation_config.encoder_no_repeat_ngram_size,
		//             encoder_input_ids
		//         ));
		//     } else {
		//         throw new Error("It's impossible to use `encoder_no_repeat_ngram_size` with decoder-only architecture");
		//     }
		// }

		// if (prefix_allowed_tokens_fn !== null) {
		//     processors.push(new PrefixConstrainedLogitsProcessor(
		//         prefix_allowed_tokens_fn,
		//         generation_config.num_beams / generation_config.num_beam_groups
		//     ));
		// }

		// if (generation_config.remove_invalid_values === true) {
		//     processors.push(new InfNanRemoveLogitsProcessor());
		// }

		// if (generation_config.exponential_decay_length_penalty !== null) {
		//     processors.push(new ExponentialDecayLengthPenalty(
		//         generation_config.exponential_decay_length_penalty,
		//         generation_config.eos_token_id,
		//         input_ids_seq_length
		//     ));
		// }

		// if (generation_config.suppress_tokens !== null) {
		//     processors.push(new SuppressTokensLogitsProcessor(generation_config.suppress_tokens));
		// }

		if (generation_config.begin_suppress_tokens !== null) {
			const begin_index =
				input_ids_seq_length > 1 ||
				generation_config.forced_bos_token_id === null
					? input_ids_seq_length
					: input_ids_seq_length + 1;

			processors.push(
				new SuppressTokensAtBeginLogitsProcessor(
					generation_config.begin_suppress_tokens,
					begin_index,
				),
			);
		}

		// DEPRECATED: https://github.com/huggingface/transformers/pull/29485
		// if (generation_config.forced_decoder_ids !== null) {
		//     processors.push(new ForceTokensLogitsProcessor(generation_config.forced_decoder_ids));
		// }

		// 8. prepare batched CFG externally

		if (logits_processor !== null) {
			// @ts-expect-error
			processors.extend(logits_processor);
		}

		// `LogitNormalization` should always be the last logit processor, when present
		// if (generation_config.renormalize_logits === true) {
		//     processors.push(new LogitNormalization());
		// }

		return processors;
	}

	/**
	 * This function merges multiple generation configs together to form a final generation config to be used by the model for text generation.
	 * It first creates an empty `GenerationConfig` object, then it applies the model's own `generation_config` property to it. Finally, if a `generation_config` object was passed in the arguments, it overwrites the corresponding properties in the final config with those of the passed config object.
	 * @param {GenerationConfig|null} generation_config A `GenerationConfig` object containing generation parameters.
	 * @param {Record<string, any>} kwargs Additional generation parameters to be used in place of those in the `generation_config` object.
	 * @returns {GenerationConfig} The final generation config object to be used by the model for text generation.
	 */
	_prepare_generation_config(
		generation_config: GenerationConfig | null,
		kwargs: Record<string, any>,
	): GenerationConfig {
		// Create empty generation config (contains defaults)
		// We pass `this.config` so that if `eos_token_id` or `bos_token_id` exist in the model's config, we will use them
		const config = {...this.config};
		for (const key of ['decoder', 'generator', 'text_config']) {
			// Special case: some models have generation attributes set in the decoder.
			// Use them if still unset in the generation config.
			if (key in config) {
				// @ts-expect-error
				Object.assign(config, config[key]);
			}
		}

		// @ts-expect-error
		const gen_config = new WhisperGenerationConfig(config);

		// Apply model's generation config, if it exists
		Object.assign(gen_config, this.generation_config ?? {});

		// Next, use any generation config specified by the user
		// when calling `generate`
		if (generation_config) {
			Object.assign(gen_config, generation_config);
		}

		// Finally, if any kwargs were passed, use them to overwrite
		if (kwargs) {
			Object.assign(
				gen_config,
				pick(kwargs, Object.getOwnPropertyNames(gen_config)),
			);
		}

		return gen_config;
	}

	/**
	 *
	 * @param {GenerationConfig} generation_config
	 * @param {StoppingCriteriaList} [stopping_criteria=null]
	 */
	_get_stopping_criteria(
		generation_config: GenerationConfig,
		stopping_criteria: StoppingCriteriaList | null = null,
	): StoppingCriteriaList {
		const criteria = new StoppingCriteriaList();

		if (generation_config.max_length !== null) {
			criteria.push(
				new MaxLengthCriteria(
					generation_config.max_length,
					this.config.max_position_embeddings ?? null,
				),
			);
		}

		if (stopping_criteria) {
			criteria.extend(stopping_criteria);
		}

		return criteria;
	}

	/**
	 * Confirms that the model class is compatible with generation.
	 * If not, raises an exception that points to the right class to use.
	 */
	_validate_model_class(): void {}

	prepare_inputs_for_generation(...args: any[]): any {
		return this._prepare_inputs_for_generation!(this, ...args);
	}

	/**
	 *
	 * @param {Object} inputs
	 * @param {bigint[][]} inputs.generated_input_ids
	 * @param {ModelOutput} inputs.outputs
	 * @param {Record<string, any>} inputs.model_inputs
	 * @param {boolean} inputs.is_encoder_decoder
	 * @returns {Record<string, any>} The updated model inputs for the next generation iteration.
	 */
	_update_model_kwargs_for_generation({
		generated_input_ids,
		outputs,
		model_inputs,
		is_encoder_decoder,
	}: {
		generated_input_ids: bigint[][];
		outputs: any;
		model_inputs: Record<string, any>;
		is_encoder_decoder: boolean;
	}): Record<string, any> {
		// update past_key_values
		model_inputs.past_key_values = this.getPastKeyValues(
			outputs,
			model_inputs.past_key_values,
		);

		// update inputs for next run
		model_inputs.input_ids = new Tensor('int64', generated_input_ids.flat(), [
			generated_input_ids.length,
			1,
		]);

		if (!is_encoder_decoder) {
			// update attention mask
			model_inputs.attention_mask = cat(
				[
					model_inputs.attention_mask,
					ones([model_inputs.attention_mask.dims[0], 1]),
				],
				1,
			);
		} else if ('decoder_attention_mask' in model_inputs) {
			// TODO: update decoder attention mask if the model requires it
		}

		// force recreate position_ids in next iteration
		model_inputs.position_ids = null;

		return model_inputs;
	}

	/**
	 * This function extracts the model-specific `inputs` for generation.
	 * @param {Object} params
	 * @param {Tensor} [params.inputs=null]
	 * @param {number} [params.bos_token_id=null]
	 * @param {Record<string, Tensor|number[]>} [params.model_kwargs]
	 * @returns {{inputs_tensor: Tensor, model_inputs: Record<string, Tensor>, model_input_name: string}} The model-specific inputs for generation.
	 */
	_prepare_model_inputs({
		inputs,
		model_kwargs,
	}: {
		inputs?: Tensor;
		bos_token_id?: number;
		model_kwargs?: Record<string, Tensor | number[]>;
	}): {
		inputs_tensor: Tensor;
		model_inputs: Record<string, Tensor>;
		model_input_name: string;
	} {
		// @ts-expect-error
		const model_inputs = pick(model_kwargs, this.forward_params);
		const input_name = this.main_input_name;
		if (input_name in model_inputs) {
			if (inputs) {
				throw new Error(
					'`inputs`: {inputs}` were passed alongside {input_name} which is not allowed. ' +
						'Make sure to either pass {inputs} or {input_name}=...',
				);
			}
		} else {
			model_inputs[input_name] = inputs;
		}

		const inputs_tensor = model_inputs[input_name];

		return {inputs_tensor, model_inputs, model_input_name: input_name};
	}

	async _prepare_encoder_decoder_kwargs_for_generation({
		model_inputs,
		generation_config,
	}: {
		model_inputs: any;
		generation_config: any;
	}) {
		if (
			this.sessions.model.inputNames.includes('inputs_embeds') &&
			!model_inputs.inputs_embeds &&
			'_prepare_inputs_embeds' in this
		) {
			// Encoder expects `inputs_embeds` instead of `input_ids`
			const {input_ids, pixel_values, attention_mask, ...kwargs} = model_inputs;
			// @ts-expect-error
			const prepared_inputs = await this._prepare_inputs_embeds(model_inputs);
			model_inputs = {
				...kwargs,
				...pick(prepared_inputs, ['inputs_embeds', 'attention_mask']),
			};
		}

		let {last_hidden_state} = await encoderForward(this, model_inputs);

		// for classifier free guidance we need to add a 'null' input to our encoder hidden states
		if (
			generation_config.guidance_scale !== null &&
			generation_config.guidance_scale > 1
		) {
			last_hidden_state = cat(
				[last_hidden_state, full_like(last_hidden_state, 0.0)],
				0,
			);

			if ('attention_mask' in model_inputs) {
				model_inputs.attention_mask = cat(
					[
						model_inputs.attention_mask,
						zeros_like(model_inputs.attention_mask),
					],
					0,
				);
			}
		} else if (model_inputs.decoder_input_ids) {
			// Ensure that the encoder outputs have the same batch size as the decoder inputs,
			// allowing for more efficient batched generation for single inputs
			const decoder_input_ids_batch_size = toI64Tensor(
				model_inputs.decoder_input_ids,
			).dims[0];
			if (decoder_input_ids_batch_size !== last_hidden_state.dims[0]) {
				if (last_hidden_state.dims[0] !== 1) {
					throw new Error(
						`The encoder outputs have a different batch size (${last_hidden_state.dims[0]}) than the decoder inputs (${decoder_input_ids_batch_size}).`,
					);
				}

				last_hidden_state = cat(
					Array.from(
						{length: decoder_input_ids_batch_size},
						() => last_hidden_state,
					),
					0,
				);
			}
		}

		model_inputs.encoder_outputs = last_hidden_state;

		return model_inputs;
	}

	/**
	 * Prepares `decoder_input_ids` for generation with encoder-decoder models
	 * @param {*} param0
	 */
	_prepare_decoder_input_ids_for_generation({
		batch_size,
		model_kwargs,
		decoder_start_token_id,
		bos_token_id,
	}: {
		batch_size: any;
		model_kwargs: any;
		decoder_start_token_id: any;
		bos_token_id: any;
	}) {
		let {decoder_input_ids, ...model_inputs} = model_kwargs;

		// Prepare input ids if the user has not defined `decoder_input_ids` manually.
		if (!(decoder_input_ids instanceof Tensor)) {
			if (!decoder_input_ids) {
				decoder_start_token_id ??= bos_token_id;

				if (this.config.model_type === 'musicgen') {
					// Custom logic (TODO: move to Musicgen class)
					decoder_input_ids = Array.from(
						{
							// @ts-expect-error TS2339
							length: batch_size * this.config.decoder.num_codebooks,
						},
						() => [decoder_start_token_id],
					);
				} else if (Array.isArray(decoder_start_token_id)) {
					if (decoder_start_token_id.length !== batch_size) {
						throw new Error(
							`\`decoder_start_token_id\` expcted to have length ${batch_size} but got ${decoder_start_token_id.length}`,
						);
					}

					decoder_input_ids = decoder_start_token_id;
				} else {
					decoder_input_ids = Array.from(
						{
							length: batch_size,
						},
						() => [decoder_start_token_id],
					);
				}
			} else if (!Array.isArray(decoder_input_ids[0])) {
				// Correct batch size
				decoder_input_ids = Array.from(
					{
						length: batch_size,
					},
					() => decoder_input_ids,
				);
			}

			decoder_input_ids = toI64Tensor(decoder_input_ids);
		}

		model_kwargs.decoder_attention_mask = ones_like(decoder_input_ids);

		return {input_ids: decoder_input_ids, model_inputs};
	}

	/**
	 * Generates sequences of token ids for models with a language modeling head.
	 * @param {import('./generation/parameters.js').GenerationFunctionParameters} options
	 * @returns {Promise<ModelOutput|Tensor>} The output of the model, which can contain the generated token ids, attentions, and scores.
	 */
	async generate({
		inputs,
		generation_config,
		logits_processor,
		stopping_criteria,
		streamer,

		// inputs_attention_mask = null,
		...kwargs
	}: {
		generation_config: GenerationConfig;
		logits_processor: LogitsProcessorList;
		stopping_criteria: StoppingCriteriaList;
		inputs: any[];
		streamer: any;
	}) {
		this._validate_model_class();

		// Update generation config with defaults and kwargs
		generation_config = this._prepare_generation_config(
			generation_config,
			kwargs,
		);

		// 3. Define model inputs
		let {model_inputs, model_input_name} = this._prepare_model_inputs({
			// @ts-expect-error
			inputs,
			model_kwargs: kwargs,
		});

		const {is_encoder_decoder} = this.config;

		// 4. Define other model kwargs
		if (!is_encoder_decoder) {
			// decoder-only models should use left-padding for generation
		} else if (!('encoder_outputs' in model_inputs)) {
			// if model is encoder decoder encoder_outputs are created
			// and added to `model_kwargs`
			model_inputs = await this._prepare_encoder_decoder_kwargs_for_generation({
				model_inputs,
				generation_config,
			});
		}

		// 5. Prepare `input_ids` which will be used for auto-regressive generation
		// TODO: Update to align with HF transformers' implementation
		let input_ids;
		if (is_encoder_decoder) {
			// Generating from the encoder outputs
			({input_ids, model_inputs} =
				this._prepare_decoder_input_ids_for_generation({
					batch_size: model_inputs[model_input_name].dims.at(0),
					model_kwargs: model_inputs,
					decoder_start_token_id: generation_config.decoder_start_token_id,
					bos_token_id: generation_config.bos_token_id,
				}));
		} else {
			input_ids = model_inputs[model_input_name];
		}

		// 6. Prepare `max_length` depending on other stopping criteria.
		const input_ids_length = input_ids.dims.at(-1);

		if (generation_config.max_new_tokens !== null) {
			// @ts-expect-error
			generation_config.max_length =
				input_ids_length + generation_config.max_new_tokens;
		}

		// input_ids_length = model_inputs[model_input_name].dims.at(1);
		// // inputs instanceof Tensor ?  : inputs.length;

		// // decoder-only
		// if (input_ids_length === 0) {
		//     throw Error("Must supply a non-empty array of input token ids.")
		// }

		// let decoder_input_ids =
		// generation_config.decoder_input_ids
		// ?? generation_config.decoder_start_token_id
		// ?? generation_config.bos_token_id
		// ?? generation_config.eos_token_id;

		// Update logits processor
		// 8. prepare distribution pre_processing samplers
		const prepared_logits_processor = this._get_logits_processor(
			generation_config,
			input_ids_length,
			logits_processor,
		);

		// 9. prepare stopping criteria
		const prepared_stopping_criteria = this._get_stopping_criteria(
			generation_config,
			stopping_criteria,
		);

		// /** @type {number[]} */
		// let eos_token_ids = generation_config.eos_token_id;
		// if (eos_token_ids !== null && !Array.isArray(eos_token_ids)) {
		//     eos_token_ids = [eos_token_ids];
		// }

		const numInputs = model_inputs[model_input_name].dims.at(0);

		// TODO:
		// done is a list of booleans to keep track of which inputs are done
		// const done = new Array(numInputs).fill(false);
		// For efficiency purposes, we remove completed rows from model_inputs
		// when the beam is complete, and we keep track of the row index
		// const rowIndexToBatchIndex = new Map();

		const sampler = LogitsSampler.getSampler(generation_config);

		// TODO make > numInputs
		const scores = new Array(numInputs).fill(0);
		/** @type {bigint[][]} */
		const all_input_ids = input_ids.tolist();
		if (streamer) {
			streamer.put(all_input_ids);
		}
		// const all_generated_input_ids = Array.from({ length: numInputs }, () => []);

		// NOTE: For now, we don't support spawning new beams
		// TODO: when we do, we simply copy past key values and accumulate into single large tensor

		/// /////////////////////////////////////////////////
		// Generic search which handles 4 generation modes:
		// - GenerationMode.GREEDY_SEARCH
		// - GenerationMode.SAMPLE
		// - GenerationMode.BEAM_SEARCH
		// - GenerationMode.BEAM_SAMPLE
		/// /////////////////////////////////////////////////
		let outputs;
		const attentions = {};
		while (true) {
			// prepare model inputs
			model_inputs = this.prepare_inputs_for_generation(
				all_input_ids,
				model_inputs,
				generation_config,
			);
			outputs = await this.forward(model_inputs);

			if (
				generation_config.output_attentions &&
				generation_config.return_dict_in_generate
			) {
				// Get attentions if they are present
				const token_attentions = this.getAttentions(outputs);
				for (const key in token_attentions) {
					if (!(key in attentions)) {
						// @ts-expect-error
						attentions[key] = [];
					}

					// @ts-expect-error
					attentions[key].push(token_attentions[key]);
				}
			}

			// Logits are of the form [batch_size, out_seq_length, vocab_size]
			// In most cases, this will be [batch_size, 1, vocab_size]
			// So, we select the last token's logits:
			// (equivalent to `logits = outputs.logits[:, -1, :]`)
			const logits = outputs.logits.slice(null, -1, null);

			const next_tokens_scores = prepared_logits_processor._call(
				all_input_ids,
				logits,
			);

			/** @type {[bigint][]} */
			const generated_input_ids = [];
			// const new_kv_cache = [];// NOTE: Only used for beam search when concatenating new kv
			// Loop over each batch
			for (
				let batch_idx = 0;
				batch_idx < next_tokens_scores.dims.at(0)!;
				++batch_idx
			) {
				// @ts-expect-error
				const logs = next_tokens_scores[batch_idx] as Tensor;

				const sampledTokens = await sampler._call(logs);

				for (const [newTokenId, logProb] of sampledTokens) {
					const bigint = BigInt(newTokenId);
					// TODO: If branching, use previous beam as a starting point
					// update generated ids, model inputs, and length for next step
					scores[batch_idx] += logProb;
					all_input_ids[batch_idx].push(bigint);
					generated_input_ids.push([bigint]);

					// TODO: Support beam search
					break;
				}
			}

			if (streamer) {
				streamer.put(generated_input_ids);
			}

			const stop = prepared_stopping_criteria._call(all_input_ids, undefined);
			if (stop.every((x: any) => x)) {
				break;
			}

			model_inputs = this._update_model_kwargs_for_generation({
				generated_input_ids,
				outputs,
				model_inputs,
				is_encoder_decoder,
			});
		}

		if (streamer) {
			streamer.end();
		}

		// Retrieve and dispose all final past key values (including encoder attentions)
		const past_key_values = this.getPastKeyValues(
			outputs,
			model_inputs.past_key_values,
			true,
		);

		// TODO: ensure all_input_ids is padded correctly...
		const sequences = new Tensor('int64', all_input_ids.flat(), [
			all_input_ids.length,
			all_input_ids[0].length,
		]);

		if (generation_config.return_dict_in_generate) {
			return {
				sequences,
				past_key_values,
				...attentions,
				// TODO:
				// scores,
				// logits,
			};
		}

		// Dispose all remaining tensors
		for (const tensor of Object.values(outputs)) {
			if ((tensor as Tensor).location === 'gpu-buffer') {
				(tensor as Tensor).dispose();
			}
		}

		return sequences;
	}

	/**
	 * Returns an object containing past key values from the given decoder results object.
	 *
	 * @param {Object} decoderResults The decoder results object.
	 * @param {Object} pastKeyValues The previous past key values.
	 * @returns {Object} An object containing past key values.
	 */
	getPastKeyValues(
		decoderResults: any,
		pastKeyValues: any,
		disposeEncoderPKVs = false,
	) {
		const pkvs = Object.create(null);

		for (const name in decoderResults) {
			if (name.startsWith('present')) {
				const newName = name.replace('present', 'past_key_values');
				const is_encoder_pkv = name.includes('encoder');
				if (is_encoder_pkv && pastKeyValues) {
					// Optimization introduced by optimum to reuse past key values.
					// So, we just replace the constant outputs (`decoderResults[name]`) with the previous past key values.
					// https://github.com/huggingface/optimum/blob/0bf2c05fb7e1182b52d21b703cfc95fd9e4ea3dc/optimum/onnxruntime/base.py#L677-L704
					pkvs[newName] = pastKeyValues[newName];
				} else {
					// decoder or using first encoder PKVs
					pkvs[newName] = decoderResults[name];
				}

				if (pastKeyValues && (!is_encoder_pkv || disposeEncoderPKVs)) {
					// - Always dispose decoder PKVs
					// - Only dispose encoder past key values when requested (after generation)
					const t = pastKeyValues[newName];
					if (t.location === 'gpu-buffer') {
						t.dispose();
					}
				}
			}
		}

		return pkvs;
	}

	/**
	 * Returns an object containing attentions from the given model output object.
	 *
	 * @param {Object} model_output The output of the model.
	 * @returns {{cross_attentions?: Tensor[]}} An object containing attentions.
	 */
	getAttentions(model_output: any) {
		const attentions = {};

		for (const attnName of [
			'cross_attentions',
			'encoder_attentions',
			'decoder_attentions',
		]) {
			for (const name in model_output) {
				if (name.startsWith(attnName)) {
					if (!(attnName in attentions)) {
						// @ts-expect-error

						attentions[attnName] = [];
					}
					// @ts-expect-error

					attentions[attnName].push(model_output[name]);
				}
			}
		}

		return attentions;
	}

	/**
	 * Adds past key values to the decoder feeds object. If pastKeyValues is null, creates new tensors for past key values.
	 *
	 * @param {Object} decoderFeeds The decoder feeds object to add past key values to.
	 * @param {Object} pastKeyValues An object containing past key values.
	 */
	addPastKeyValues(decoderFeeds: any, pastKeyValues: any) {
		if (pastKeyValues) {
			Object.assign(decoderFeeds, pastKeyValues);
		} else {
			const session = this.sessions.decoder_model_merged ?? this.sessions.model;
			const dtype = session?.config?.kv_cache_dtype ?? 'float32';
			// eslint-disable-next-line new-cap
			const empty = dtype === 'float16' ? new DataTypeMap.float16() : [];

			const batch_size =
				(decoderFeeds[this.main_input_name] ?? decoderFeeds.attention_mask)
					?.dims?.[0] ?? 1;
			const shapes = getKeyValueShapes(this.config, {batch_size});

			for (const name in shapes) {
				decoderFeeds[name] = new Tensor(dtype, empty, shapes[name]);
			}
		}
	}

	async encode_image({pixel_values}: {pixel_values: any}) {
		// image_inputs === { pixel_values }
		const features = (
			await sessionRun(this.sessions.vision_encoder, {pixel_values})
		).image_features;
		// @ts-expect-error TS2339
		if (!this.config.num_image_tokens) {
			// eslint-disable-next-line no-console
			console.warn(
				'The number of image tokens was not set in the model configuration. ' +
					`Setting it to the number of features detected by the vision encoder (${features.dims[1]}).`,
			);
			// @ts-expect-error TS2339
			this.config.num_image_tokens = features.dims[1];
		}

		return features;
	}

	async encode_text({input_ids}: {input_ids: any}) {
		// text_inputs === { input_ids, attention_mask }
		return (await sessionRun(this.sessions.embed_tokens, {input_ids}))
			.inputs_embeds;
	}

	async encode_audio({audio_values}: {audio_values: Tensor}) {
		// audio_inputs === { audio_values }
		return (await sessionRun(this.sessions.audio_encoder, {audio_values}))
			.audio_features;
	}
}
