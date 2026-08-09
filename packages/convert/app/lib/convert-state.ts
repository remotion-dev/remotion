import type {ConvertProgressType} from './progress';

export type Source =
	| {
			type: 'url';
			url: string;
	  }
	| {
			type: 'file';
			file: File;
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
			newName: string;
	  }
	| {
			type: 'done';
			download: () => Promise<File>;
			draggableFile: File | null;
			state: ConvertProgressType;
			startTime: number;
			completedTime: number;
			newName: string;
	  }
	| {
			type: 'error';
			error: Error;
	  };
