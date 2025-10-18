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
			onAbort: () => void;
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
