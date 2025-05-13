import type {
	PretrainedConfig,
	ProgressCallback,
} from '@huggingface/transformers';
import {
	AutoConfig,
	WhisperForConditionalGeneration,
} from '@huggingface/transformers';

/**
 * Base class of all AutoModels. Contains the `from_pretrained` function
 * which is used to instantiate pretrained models.
 */
export class PretrainedMixin {
	/**
	 * Mapping from model type to model class.
	 * @type {Map<string, Object>[]}
	 */
	static MODEL_CLASS_MAPPINGS: Map<string, Object>[] | null = null;

	/** @type {typeof PreTrainedModel.from_pretrained} */
	static async from_pretrained(
		pretrained_model_name_or_path: string,
		{
			progress_callback = undefined,
			config = undefined,
			cache_dir = undefined,
			local_files_only = false,
			revision = 'main',
			model_file_name = undefined,
			subfolder = 'onnx',
			device = undefined,
			dtype = undefined,
			use_external_data_format = undefined,
			session_options = {},
		}: {
			progress_callback?: undefined | ProgressCallback;
			config?: PretrainedConfig | undefined;
			cache_dir?: string | undefined;
			local_files_only?: boolean;
			revision?: string;
			model_file_name?: string | undefined;
			subfolder?: string;
			device?: 'webgpu' | undefined;
			dtype?:
				| Record<
						string,
						| 'auto'
						| 'fp32'
						| 'fp16'
						| 'q8'
						| 'int8'
						| 'uint8'
						| 'q4'
						| 'bnb4'
						| 'q4f16'
				  >
				| undefined;
			use_external_data_format?: boolean | undefined;
			session_options?: Record<string, unknown>;
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
		options.config = await AutoConfig.from_pretrained(
			pretrained_model_name_or_path,
			options,
		);

		if (!this.MODEL_CLASS_MAPPINGS) {
			throw new Error(
				'`MODEL_CLASS_MAPPINGS` not implemented for this type of `AutoClass`: ' +
					this.name,
			);
		}

		const modelInfo = [
			'WhisperForConditionalGeneration',
			WhisperForConditionalGeneration,
		] as const;

		return modelInfo[1].from_pretrained(pretrained_model_name_or_path, options);
	}
}
