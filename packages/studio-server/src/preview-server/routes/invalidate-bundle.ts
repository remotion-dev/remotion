import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {invalidatePreviouslySuppressedFiles} from '../watch-ignore-next-change';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const invalidateBundleHandler: ApiHandler<
	ApiRoutes['/api/invalidate-bundle']['Request'],
	ApiRoutes['/api/invalidate-bundle']['Response']
> = () => {
	return withSourceFileWriteQueue(async () => {
		return {didInvalidate: await invalidatePreviouslySuppressedFiles()};
	});
};
