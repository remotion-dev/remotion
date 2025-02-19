import type {
	RestartStudioRequest,
	RestartStudioResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {signalRestart} from '../close-and-restart';

export const handleRestartStudio: ApiHandler<
	RestartStudioRequest,
	RestartStudioResponse
> = () => {
	signalRestart();

	return Promise.resolve({});
};
