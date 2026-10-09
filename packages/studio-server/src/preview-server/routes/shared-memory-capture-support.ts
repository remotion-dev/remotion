import {RenderInternals} from '@remotion/renderer';
import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

export const sharedMemoryCaptureSupportHandler: ApiHandler<
	ApiRoutes['/api/shared-memory-capture-support']['Request'],
	ApiRoutes['/api/shared-memory-capture-support']['Response']
> = async ({input, binariesDirectory, logLevel}) => {
	const supported = await RenderInternals.probeSharedMemoryCapture({
		...input,
		binariesDirectory,
		logLevel,
	});
	return {supported};
};
