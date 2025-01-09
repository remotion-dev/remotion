import type {VideoConfig} from 'remotion/no-react';
import type {ServerlessRoutines} from './constants';
import type {GenericRenderProgress} from './render-progress';
import type {CloudProvider} from './types';

export type OrError<T> =
	| T
	| {
			type: 'error';
			message: string;
			stack: string;
	  };

export interface ServerlessReturnValues<Provider extends CloudProvider> {
	[ServerlessRoutines.start]: Promise<{
		type: 'success';
		bucketName: string;
		renderId: string;
	}>;
	[ServerlessRoutines.launch]: Promise<{
		type: 'success';
	}>;
	[ServerlessRoutines.renderer]: Promise<{
		type: 'success';
	}>;
	[ServerlessRoutines.status]: Promise<GenericRenderProgress<Provider>>;
	[ServerlessRoutines.info]: {
		version: string;
		type: 'success';
	};
	[ServerlessRoutines.still]: Promise<
		| {
				type: 'success';
		  }
		| {
				type: 'error';
				message: string;
				stack: string;
		  }
	>;
	[ServerlessRoutines.compositions]: Promise<{
		compositions: VideoConfig[];
		type: 'success';
	}>;
}
