import {Callable} from './callable';

/**
 * A base class for pre-trained models that provides the model configuration and an ONNX session.
 */
export class PreTrainedModel extends Callable {
	main_input_name = 'input_ids';
	forward_params = ['input_ids', 'attention_mask'];
	/**
	 * Creates a new instance of the `PreTrainedModel` class.
	 * @param {import('./configs.js').PretrainedConfig} config The model configuration.
	 * @param {Record<string, any>} sessions The inference sessions for the model.
	 * @param {Record<string, Object>} configs Additional configuration files (e.g., generation_config.json).
	 */
	constructor(config, sessions, configs) {
		super();

		this.config = config;
		this.sessions = sessions;
		this.configs = configs;

		const modelName = MODEL_CLASS_TO_NAME_MAPPING.get(this.constructor);
		const modelType = MODEL_TYPE_MAPPING.get(modelName);

		this.can_generate = false;
		this._forward = null;

		this._prepare_inputs_for_generation = null;
		switch (modelType) {
			case MODEL_TYPES.DecoderOnly:
				this.can_generate = true;
				this._forward = decoderForward;
				this._prepare_inputs_for_generation =
					decoder_prepare_inputs_for_generation;
				break;
			case MODEL_TYPES.Seq2Seq:
			case MODEL_TYPES.Vision2Seq:
			case MODEL_TYPES.Musicgen:
				this.can_generate = true;

				this._forward = seq2seqForward;
				this._prepare_inputs_for_generation =
					encoder_decoder_prepare_inputs_for_generation;
				break;

			case MODEL_TYPES.EncoderDecoder:
				this._forward = seq2seqForward;
				break;
			case MODEL_TYPES.ImageTextToText:
				this.can_generate = true;
				this._forward = imageTextToTextForward;
				this._prepare_inputs_for_generation =
					multimodal_text_to_text_prepare_inputs_for_generation;
				break;
			case MODEL_TYPES.AudioTextToText:
				this.can_generate = true;
				this._forward = audioTextToTextForward;
				this._prepare_inputs_for_generation =
					multimodal_text_to_text_prepare_inputs_for_generation;
				break;
			case MODEL_TYPES.Phi3V:
				this.can_generate = true;
				this._prepare_inputs_for_generation =
					multimodal_text_to_text_prepare_inputs_for_generation;
				break;
			case MODEL_TYPES.MultiModality:
				this.can_generate = true;
				this._prepare_inputs_for_generation =
					multimodality_prepare_inputs_for_generation;
				break;
			case MODEL_TYPES.AutoEncoder:
				this._forward = autoEncoderForward;
				break;
			default:
				// should be MODEL_TYPES.EncoderOnly
				this._forward = encoderForward;
				break;
		}

		if (this.can_generate) {
			this.forward_params.push('past_key_values');
		}

		/** @type {import('./configs.js').TransformersJSConfig} */
		this.custom_config = this.config['transformers.js_config'] ?? {};
	}

	/**
	 * Disposes of all the ONNX sessions that were created during inference.
	 * @returns {Promise<unknown[]>} An array of promises, one for each ONNX session that is being disposed.
	 * @todo Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
	 */
	async dispose() {
		const promises = [];
		for (const session of Object.values(this.sessions)) {
			if (session?.handler?.dispose) {
				promises.push(session.handler.dispose());
			}
		}

		return await Promise.all(promises);
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
	 * @param {import('./utils/hub.js').PretrainedModelOptions} options Additional options for loading the model.
	 *
	 * @returns {Promise<PreTrainedModel>} A new instance of the `PreTrainedModel` class.
	 */
	static async from_pretrained(
		pretrained_model_name_or_path,
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
		} = {},
	) {
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

		const modelName = MODEL_CLASS_TO_NAME_MAPPING.get(this);
		const modelType = MODEL_TYPE_MAPPING.get(modelName);

		config = options.config = await AutoConfig.from_pretrained(
			pretrained_model_name_or_path,
			options,
		);

		let info;
		if (modelType === MODEL_TYPES.DecoderOnly) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: options.model_file_name ?? 'model',
					},
					options,
				),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (
			modelType === MODEL_TYPES.Seq2Seq ||
			modelType === MODEL_TYPES.Vision2Seq
		) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: 'encoder_model',
						decoder_model_merged: 'decoder_model_merged',
					},
					options,
				),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.MaskGeneration) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: 'vision_encoder',
						prompt_encoder_mask_decoder: 'prompt_encoder_mask_decoder',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.EncoderDecoder) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: 'encoder_model',
						decoder_model_merged: 'decoder_model_merged',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.ImageTextToText) {
			const sessions = {
				embed_tokens: 'embed_tokens',
				vision_encoder: 'vision_encoder',
				decoder_model_merged: 'decoder_model_merged',
			};
			if (config.is_encoder_decoder) {
				sessions.model = 'encoder_model';
			}

			info = await Promise.all([
				constructSessions(pretrained_model_name_or_path, sessions, options),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.AudioTextToText) {
			const sessions = {
				embed_tokens: 'embed_tokens',
				audio_encoder: 'audio_encoder',
				decoder_model_merged: 'decoder_model_merged',
			};
			info = await Promise.all([
				constructSessions(pretrained_model_name_or_path, sessions, options),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.Musicgen) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: 'text_encoder',
						decoder_model_merged: 'decoder_model_merged',
						encodec_decode: 'encodec_decode',
					},
					options,
				),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.MultiModality) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						prepare_inputs_embeds: 'prepare_inputs_embeds',
						model: 'language_model',
						lm_head: 'lm_head',
						gen_head: 'gen_head',
						gen_img_embeds: 'gen_img_embeds',
						image_decode: 'image_decode',
					},
					options,
				),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.Phi3V) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						prepare_inputs_embeds: 'prepare_inputs_embeds',
						model: 'model',
						vision_encoder: 'vision_encoder',
					},
					options,
				),
				getOptionalConfigs(
					pretrained_model_name_or_path,
					{
						generation_config: 'generation_config.json',
					},
					options,
				),
			]);
		} else if (modelType === MODEL_TYPES.AutoEncoder) {
			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						encoder_model: 'encoder_model',
						decoder_model: 'decoder_model',
					},
					options,
				),
			]);
		} else {
			// should be MODEL_TYPES.EncoderOnly
			if (modelType !== MODEL_TYPES.EncoderOnly) {
				const type = modelName ?? config?.model_type;
				if (type !== 'custom') {
					console.warn(
						`Model type for '${type}' not found, assuming encoder-only architecture. Please report this at ${GITHUB_ISSUE_URL}.`,
					);
				}
			}

			info = await Promise.all([
				constructSessions(
					pretrained_model_name_or_path,
					{
						model: options.model_file_name ?? 'model',
					},
					options,
				),
			]);
		}

		// @ts-expect-error
		return new this(config, ...info);
	}

	/**
	 * Runs the model with the provided inputs
	 * @param {Object} model_inputs Object containing input tensors
	 * @returns {Promise<Object>} Object containing output tensors
	 */
	async _call(model_inputs) {
		return await this.forward(model_inputs);
	}

	/**
	 * Forward method for a pretrained model. If not overridden by a subclass, the correct forward method
	 * will be chosen based on the model type.
	 * @param {Object} model_inputs The input data to the model in the format specified in the ONNX model.
	 * @returns {Promise<Object>} The output data from the model in the format specified in the ONNX model.
	 * @throws {Error} This method must be implemented in subclasses.
	 */
	async forward(model_inputs) {
		return await this._forward(this, model_inputs);
	}

	/**
	 * Get the model's generation config, if it exists.
	 * @returns {GenerationConfig|null} The model's generation config if it exists, otherwise `null`.
	 */
	get generation_config() {
		return this.configs?.generation_config ?? null;
	}

	/**
	 * This function returns a [`LogitsProcessorList`] list object that contains all relevant [`LogitsWarper`]
	 * instances used for multinomial sampling.
	 * @param {GenerationConfig} generation_config The generation config.
	 * @returns {LogitsProcessorList} generation_config
	 */
	_get_logits_warper(generation_config) {
		// instantiate warpers list
		const warpers = new LogitsProcessorList();

		if (
			generation_config.temperature !== null &&
			generation_config.temperature !== 1.0
		) {
			warpers.push(new TemperatureLogitsWarper(generation_config.temperature));
		}

		if (generation_config.top_k !== null && generation_config.top_k !== 0) {
			// TODO: add min_tokens_to_keep
			warpers.push(new TopKLogitsWarper(generation_config.top_k));
		}

		if (generation_config.top_p !== null && generation_config.top_p < 1.0) {
			// TODO: add min_tokens_to_keep
			warpers.push(new TopPLogitsWarper(generation_config.top_p));
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
		generation_config,
		input_ids_seq_length,
		// encoder_input_ids, TODO
		// prefix_allowed_tokens_fn, TODO
		logits_processor = null,
	) {
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

		if (
			generation_config.repetition_penalty !== null &&
			generation_config.repetition_penalty !== 1.0
		) {
			processors.push(
				new RepetitionPenaltyLogitsProcessor(
					generation_config.repetition_penalty,
				),
			);
		}

		if (
			generation_config.no_repeat_ngram_size !== null &&
			generation_config.no_repeat_ngram_size > 0
		) {
			processors.push(
				new NoRepeatNGramLogitsProcessor(
					generation_config.no_repeat_ngram_size,
				),
			);
		}

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

		if (generation_config.bad_words_ids !== null) {
			processors.push(
				new NoBadWordsLogitsProcessor(
					generation_config.bad_words_ids,
					generation_config.eos_token_id,
				),
			);
		}

		if (
			generation_config.min_length !== null &&
			generation_config.eos_token_id !== null &&
			generation_config.min_length > 0
		) {
			processors.push(
				new MinLengthLogitsProcessor(
					generation_config.min_length,
					generation_config.eos_token_id,
				),
			);
		}

		if (
			generation_config.min_new_tokens !== null &&
			generation_config.eos_token_id !== null &&
			generation_config.min_new_tokens > 0
		) {
			processors.push(
				new MinNewTokensLengthLogitsProcessor(
					input_ids_seq_length,
					generation_config.min_new_tokens,
					generation_config.eos_token_id,
				),
			);
		}

		// if (prefix_allowed_tokens_fn !== null) {
		//     processors.push(new PrefixConstrainedLogitsProcessor(
		//         prefix_allowed_tokens_fn,
		//         generation_config.num_beams / generation_config.num_beam_groups
		//     ));
		// }

		if (generation_config.forced_bos_token_id !== null) {
			processors.push(
				new ForcedBOSTokenLogitsProcessor(
					generation_config.forced_bos_token_id,
				),
			);
		}

		if (generation_config.forced_eos_token_id !== null) {
			processors.push(
				new ForcedEOSTokenLogitsProcessor(
					generation_config.max_length,
					generation_config.forced_eos_token_id,
				),
			);
		}

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
		if (
			generation_config.guidance_scale !== null &&
			generation_config.guidance_scale > 1
		) {
			processors.push(
				new ClassifierFreeGuidanceLogitsProcessor(
					generation_config.guidance_scale,
				),
			);
		}

		if (logits_processor !== null) {
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
	 * @param {Object} kwargs Additional generation parameters to be used in place of those in the `generation_config` object.
	 * @returns {GenerationConfig} The final generation config object to be used by the model for text generation.
	 */
	_prepare_generation_config(
		generation_config,
		kwargs,
		cls = GenerationConfig,
	) {
		// Create empty generation config (contains defaults)
		// We pass `this.config` so that if `eos_token_id` or `bos_token_id` exist in the model's config, we will use them
		const config = {...this.config};
		for (const key of ['decoder', 'generator', 'text_config']) {
			// Special case: some models have generation attributes set in the decoder.
			// Use them if still unset in the generation config.
			if (key in config) {
				Object.assign(config, config[key]);
			}
		}

		const gen_config = new cls(config);

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
	_get_stopping_criteria(generation_config, stopping_criteria = null) {
		const criteria = new StoppingCriteriaList();

		if (generation_config.max_length !== null) {
			criteria.push(
				new MaxLengthCriteria(
					generation_config.max_length,
					this.config.max_position_embeddings ?? null,
				),
			);
		}

		// if (generation_config.max_time !== null) {
		//     criteria.push(new MaxTimeCriteria(generation_config.max_time));
		// }
		if (generation_config.eos_token_id !== null) {
			criteria.push(new EosTokenCriteria(generation_config.eos_token_id));
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
	_validate_model_class() {
		if (!this.can_generate) {
			const generate_compatible_mappings = [
				MODEL_FOR_CAUSAL_LM_MAPPING_NAMES,
				// MODEL_FOR_CAUSAL_IMAGE_MODELING_MAPPING, // TODO
				MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES,
				MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES,
				MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES,
			];

			const modelName = MODEL_CLASS_TO_NAME_MAPPING.get(this.constructor);

			const generate_compatible_classes = new Set();
			const modelType = this.config.model_type;
			for (const model_mapping of generate_compatible_mappings) {
				const supported_models = model_mapping.get(modelType);
				if (supported_models) {
					generate_compatible_classes.add(supported_models[0]);
				}
			}

			let errorMessage = `The current model class (${modelName}) is not compatible with \`.generate()\`, as it doesn't have a language model head.`;
			if (generate_compatible_classes.size > 0) {
				errorMessage += ` Please use the following class instead: ${[...generate_compatible_classes].join(', ')}`;
			}

			throw Error(errorMessage);
		}
	}

	prepare_inputs_for_generation(...args) {
		return this._prepare_inputs_for_generation(this, ...args);
	}

	/**
	 *
	 * @param {Object} inputs
	 * @param {bigint[][]} inputs.generated_input_ids
	 * @param {Object} inputs.outputs
	 * @param {Object} inputs.model_inputs
	 * @param {boolean} inputs.is_encoder_decoder
	 * @returns {Object} The updated model inputs for the next generation iteration.
	 */
	_update_model_kwargs_for_generation({
		generated_input_ids,
		outputs,
		model_inputs,
		is_encoder_decoder,
	}) {
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
	_prepare_model_inputs({inputs, bos_token_id, model_kwargs}) {
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
		inputs_tensor,
		model_inputs,
		model_input_name,
		generation_config,
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
		model_input_name,
		model_kwargs,
		decoder_start_token_id,
		bos_token_id,
		generation_config,
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
		inputs = null,
		generation_config = null,
		logits_processor = null,
		stopping_criteria = null,
		streamer = null,

		// inputs_attention_mask = null,
		...kwargs
	}) {
		this._validate_model_class();

		// Update generation config with defaults and kwargs
		generation_config = this._prepare_generation_config(
			generation_config,
			kwargs,
		);

		// 3. Define model inputs
		let {inputs_tensor, model_inputs, model_input_name} =
			this._prepare_model_inputs({
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
				inputs_tensor,
				model_inputs,
				model_input_name,
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
					model_input_name,
					model_kwargs: model_inputs,
					decoder_start_token_id: generation_config.decoder_start_token_id,
					bos_token_id: generation_config.bos_token_id,
					generation_config,
				}));
		} else {
			input_ids = model_inputs[model_input_name];
		}

		// 6. Prepare `max_length` depending on other stopping criteria.
		const input_ids_length = input_ids.dims.at(-1);

		if (generation_config.max_new_tokens !== null) {
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
						attentions[key] = [];
					}

					attentions[key].push(token_attentions[key]);
				}
			}

			// Logits are of the form [batch_size, out_seq_length, vocab_size]
			// In most cases, this will be [batch_size, 1, vocab_size]
			// So, we select the last token's logits:
			// (equivalent to `logits = outputs.logits[:, -1, :]`)
			const logits = outputs.logits.slice(null, -1, null);

			const next_tokens_scores = prepared_logits_processor(
				all_input_ids,
				logits,
			);

			/** @type {[bigint][]} */
			const generated_input_ids = [];
			// const new_kv_cache = [];// NOTE: Only used for beam search when concatenating new kv
			// Loop over each batch
			for (
				let batch_idx = 0;
				batch_idx < next_tokens_scores.dims.at(0);
				++batch_idx
			) {
				const logs = next_tokens_scores[batch_idx];

				const sampledTokens = await sampler(logs);
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

			const stop = prepared_stopping_criteria(all_input_ids);
			if (stop.every((x) => x)) {
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
			if (tensor.location === 'gpu-buffer') {
				tensor.dispose();
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
	getPastKeyValues(decoderResults, pastKeyValues, disposeEncoderPKVs = false) {
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
	getAttentions(model_output) {
		const attentions = {};

		for (const attnName of [
			'cross_attentions',
			'encoder_attentions',
			'decoder_attentions',
		]) {
			for (const name in model_output) {
				if (name.startsWith(attnName)) {
					if (!(attnName in attentions)) {
						attentions[attnName] = [];
					}

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
	addPastKeyValues(decoderFeeds, pastKeyValues) {
		if (pastKeyValues) {
			Object.assign(decoderFeeds, pastKeyValues);
		} else {
			const session = this.sessions.decoder_model_merged ?? this.sessions.model;
			const dtype = session?.config?.kv_cache_dtype ?? 'float32';
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

	async encode_image({pixel_values}) {
		// image_inputs === { pixel_values }
		const features = (
			await sessionRun(this.sessions.vision_encoder, {pixel_values})
		).image_features;
		// @ts-expect-error TS2339
		if (!this.config.num_image_tokens) {
			console.warn(
				'The number of image tokens was not set in the model configuration. ' +
					`Setting it to the number of features detected by the vision encoder (${features.dims[1]}).`,
			);
			// @ts-expect-error TS2339
			this.config.num_image_tokens = features.dims[1];
		}

		return features;
	}

	async encode_text({input_ids}) {
		// text_inputs === { input_ids, attention_mask }
		return (await sessionRun(this.sessions.embed_tokens, {input_ids}))
			.inputs_embeds;
	}

	async encode_audio({audio_values}) {
		// audio_inputs === { audio_values }
		return (await sessionRun(this.sessions.audio_encoder, {audio_values}))
			.audio_features;
	}
}
