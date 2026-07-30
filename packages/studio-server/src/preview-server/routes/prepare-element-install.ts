import type {
	PrepareElementInstallRequest,
	PrepareElementInstallResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {getElementInstallPlan} from './element-install-plan';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const prepareElementInstallHandler: ApiHandler<
	PrepareElementInstallRequest,
	PrepareElementInstallResponse
> = ({input, remotionRoot}) =>
	withSourceFileWriteQueue(async () => {
		try {
			const plan = await getElementInstallPlan({...input, remotionRoot});
			return {
				success: true,
				plan: {
					expectedFileState: plan.expectedFileState,
					filePath: plan.filePath,
				},
			};
		} catch (error) {
			return {
				success: false,
				reason: (error as Error).message,
				stack: (error as Error).stack as string,
			};
		}
	});
