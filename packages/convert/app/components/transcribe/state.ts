import type {Caption} from '@remotion/captions';
import type {
	WhisperWebGpuModelLoadProgress,
	WhisperWebGpuTranscription,
} from '@remotion/whisper-webgpu';

export type TranscriptionState =
	| {
			type: 'idle';
	  }
	| {
			type: 'initializing';
	  }
	| {
			type: 'downloading-model';
			progress: WhisperWebGpuModelLoadProgress;
	  }
	| {
			type: 'transcribing';
	  }
	| {
			type: 'done';
			result: Caption[];
			whisperWebGpuOutput: WhisperWebGpuTranscription;
	  }
	| {type: 'error'; message: string};
