import {ConvertMediaState} from '@remotion/webcodecs';

export type ConvertState =
	| {
			type: 'idle';
	  }
	| {type: 'in-progress'; abortConversion: () => void; state: ConvertMediaState}
	| {
			type: 'done';
			download: () => void;
			state: ConvertMediaState;
	  };
