import type {WebCodecsController} from '@remotion/webcodecs';
import type {ConvertProgressType} from './progress';

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
			state: ConvertProgressType;
			startTime: number;
	  }
	| {
			type: 'done';
			download: () => Promise<Blob>;
			state: ConvertProgressType;
			startTime: number;
			completedTime: number;
	  }
	| {
			type: 'error';
			error: Error;
	  };
