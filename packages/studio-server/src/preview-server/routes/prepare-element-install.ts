import {CodemodsInternals} from '@remotion/codemods';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
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
> = ({entryPoint, input, remotionRoot}) =>
	withSourceFileWriteQueue(async () => {
		try {
			StudioProtocolInternals.assertElementAssets(input.element.assets);
			const {sourceCode} = CodemodsInternals.lowerElementStaticFileRefs({
				assets: input.element.assets,
				sourceCode: input.element.sourceCode,
			});
			const plan = await getElementInstallPlan({
				...input,
				element: {...input.element, sourceCode},
				entryPoint,
				remotionRoot,
			});
			return {
				success: true,
				plan: {
					compositionFile: plan.destinationCompositionFileName,
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
