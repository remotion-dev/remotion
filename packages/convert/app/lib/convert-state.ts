import type {
	ConvertMediaProgress,
	WebCodecsController,
} from '@remotion/webcodecs';

export type Source =
	| {
			type: 'url';
			url: string;
	  }
	| {
			type: 'file';
			file: Blob;
	  };

export type ConvertState =
	| {
			type: 'idle';
	  }
	| {
			type: 'in-progress';
			controller: WebCodecsController;
			state: ConvertMediaProgress;
	  }
	| {
			type: 'done';
			download: () => Promise<Blob>;
			state: ConvertMediaProgress;
	  }
	| {
			type: 'error';
			error: Error;
	  };
