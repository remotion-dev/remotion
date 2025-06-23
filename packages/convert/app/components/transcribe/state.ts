import type {Caption} from '@remotion/captions';
import type {DownloadWhisperModelProgress} from '@remotion/whisper-web';

export type TranscriptionState =
	| {
			type: 'idle';
	  }
	| {
			type: 'initializing';
	  }
	| {
			type: 'downloading-model';
			progress: DownloadWhisperModelProgress;
	  }
	| {
			type: 'transcribing';
			result: Caption[];
			progress: number;
	  }
	| {type: 'done'; result: Caption[]}
	| {type: 'error'};
