import {readFileSync} from 'fs';
import {updateDefaultProps} from '../../codemods/update-default-props';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import type {
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse,
} from '../render-queue/job';

export const canUpdateDefaultPropsHandler: ApiHandler<
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse
> = async ({input: {compositionId}, remotionRoot}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot);
		// TODO: If root file is not TypeScript, you cannot save it back
		if (!projectInfo.videoFile) {
			throw new Error('Cannot find root file in project');
		}

		await updateDefaultProps({
			compositionId,
			input: readFileSync(projectInfo.videoFile, 'utf-8'),
			newDefaultProps: {},
		});

		return {
			canUpdate: true,
		};
	} catch (err) {
		return {
			canUpdate: false,
			reason: (err as Error).message,
		};
	}
};
