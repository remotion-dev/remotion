import type {Caption} from '@remotion/captions';
import type {
	ResolvedWhisperWebGpuBackend,
	WhisperWebGpuModelLoadProgress,
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
			backend: ResolvedWhisperWebGpuBackend;
	  }
	| {
			type: 'done';
			result: Caption[];
			backend: ResolvedWhisperWebGpuBackend;
	  }
	| {type: 'error'; message: string};
