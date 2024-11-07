import {ConvertMediaState} from '@remotion/webcodecs';

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
	| {type: 'in-progress'; abortConversion: () => void; state: ConvertMediaState}
	| {
			type: 'done';
			download: () => void;
			state: ConvertMediaState;
	  }
	| {
			type: 'error';
			error: Error;
	  };
