import type {ApiRoutes} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {consumeSuppressedFilesForRebuild} from '../watch-ignore-next-change';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const invalidateBundleHandler = (
	params: Parameters<
		ApiHandler<
			ApiRoutes['/api/invalidate-bundle']['Request'],
			ApiRoutes['/api/invalidate-bundle']['Response']
		>
	>[0] & {
		readonly invalidateBundle: (files: string[]) => Promise<void>;
	},
) => {
	return withSourceFileWriteQueue(async () => {
		const files = consumeSuppressedFilesForRebuild();
		if (files.length === 0) {
			return {didInvalidate: false};
		}

		await params.invalidateBundle(files);
		return {didInvalidate: true};
	});
};
