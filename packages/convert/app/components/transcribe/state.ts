import type {Caption} from '@remotion/captions';
import type {WhisperWebGpuModelLoadProgress} from '@remotion/whisper-webgpu';

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
	  }
	| {type: 'error'; message: string};
