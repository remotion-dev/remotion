import type {VideoConfig} from 'remotion/no-react';
import type {GenericRenderProgress} from './render-progress';
import type {ServerlessRoutines} from './shared-constants';

export type OrError<T> =
	| T
	| {
			type: 'error';
			message: string;
			stack: string;
	  };

export interface ServerlessReturnValues {
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
	[ServerlessRoutines.status]: Promise<GenericRenderProgress>;
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
