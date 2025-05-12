/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
	AutomaticSpeechRecognitionPipeline,
	AutoTokenizer,
	PreTrainedModel,
} from '@huggingface/transformers';
import {whisperModelConfig} from './web/model-config';
import {pipeline} from './web/pipeline';
import {whisperProcessorConfig} from './web/whisper-config';
import {WhisperTextStreamer} from './web/whisper-text-streamer';

type Chunk = {
	text: string;
	offset: number;
	timestamp: [number, number | null];
	finalised: boolean;
};

// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
	static task: string | null = null;
	static model: string | null = null;
	tokenizer: AutoTokenizer;
	model: PreTrainedModel;
	instance: Promise<AutomaticSpeechRecognitionPipeline> | null;

	constructor(tokenizer: AutoTokenizer, model: PreTrainedModel) {
		this.tokenizer = tokenizer;
		this.model = model;
		this.instance = null;
	}

	static getInstance(progress_callback: (data: any) => void) {
		// TODO: Should be able to cache it
		return pipeline(this.model, {
			dtype: {
				encoder_model:
					this.model === 'onnx-community/whisper-large-v3-turbo'
						? 'fp16'
						: 'fp32',
				decoder_model_merged: 'q4', // or 'fp32' ('fp16' is broken)
			},
			device: 'webgpu',
			progress_callback,
		});
	}
}

self.addEventListener('message', async (event) => {
	const message = event.data;

	// Do some work...
	// TODO use message data
	try {
		const transcript = await transcribeWhisperWeb(message);
		if (transcript === null) return;

		// Send the result back to the main thread
		self.postMessage({
			status: 'complete',
			data: transcript,
		});
	} catch (error) {
		self.postMessage({
			status: 'error',
			data: error,
		});
	}
});

class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
	static task = 'automatic-speech-recognition';
	static model: string | null = null;
}

const transcribeWhisperWeb = async ({
	audio,
	model,
	subtask,
	language,
}: {
	audio: (string | URL)[];
	model: string;
	subtask: string;
	language: string;
}) => {
	const isDistilWhisper = model.startsWith('distil-whisper/');

	// Load transcriber model
	const transcriber =
		await AutomaticSpeechRecognitionPipelineFactory.getInstance((data) => {
			self.postMessage(data);
		});

	const time_precision =
		whisperProcessorConfig.chunk_length /
		whisperModelConfig.max_source_positions;

	// Storage for chunks to be processed. Initialise with an empty chunk.
	const chunks: Chunk[] = [];

	const chunk_length_s = isDistilWhisper ? 20 : 30;
	const stride_length_s = isDistilWhisper ? 3 : 5;

	let chunk_count = 0;
	let start_time;
	let num_tokens = 0;
	let tps: number | undefined;
	const streamer = new WhisperTextStreamer(transcriber.tokenizer, {
		time_precision,
		on_chunk_start: (x) => {
			const offset = (chunk_length_s - stride_length_s) * chunk_count;
			chunks.push({
				text: '',
				timestamp: [offset + x, null],
				finalised: false,
				offset,
			});
		},
		token_callback_function: () => {
			start_time ??= performance.now();
			if (num_tokens++ > 0) {
				tps = (num_tokens / (performance.now() - start_time)) * 1000;
			}
		},
		callback_function: (x) => {
			if (chunks.length === 0) return;
			// Append text to the last chunk
			(chunks.at(-1) as Chunk).text += x;

			self.postMessage({
				status: 'update',
				data: {
					text: '', // No need to send full text yet
					chunks,
					tps,
				},
			});
		},
		on_chunk_end: (x) => {
			const current = chunks.at(-1) as Chunk;
			current.timestamp[1] = x + current.offset;
			current.finalised = true;
		},
		on_finalize: () => {
			start_time = null;
			num_tokens = 0;
			++chunk_count;
		},
	});

	// Actually run transcription
	const output = await transcriber
		._call(audio, {
			// Greedy
			top_k: 0,
			do_sample: false,

			// Sliding window
			chunk_length_s,
			stride_length_s,

			// Language and task
			language,
			task: subtask,

			// Return timestamps
			return_timestamps: true,
			force_full_sequences: false,

			// Callback functions
			streamer, // after each generation step
		})
		.catch((err: Error) => {
			self.postMessage({
				status: 'error',
				data: err,
			});
			return null;
		});

	return {
		tps,
		...output,
	};
};
