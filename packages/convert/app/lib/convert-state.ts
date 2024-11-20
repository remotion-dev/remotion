import {ConvertMediaState} from '@remotion/webcodecs';

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
	| {type: 'in-progress'; abortConversion: () => void; state: ConvertMediaState}
	| {
			type: 'done';
			download: () => Promise<Blob>;
			state: ConvertMediaState;
	  }
	| {
			type: 'error';
			error: Error;
	  };
