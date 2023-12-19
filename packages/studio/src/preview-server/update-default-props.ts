import {readFileSync, writeFileSync} from 'node:fs';
import type {ApiHandler} from '../api-types';
import {updateDefaultProps} from '../codemods/update-default-props';
import {getProjectInfo} from '../project-info';
import type {
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from '../render-queue/job';
import {checkIfTypeScriptFile} from './can-update-default-props';

export const updateDefaultPropsHandler: ApiHandler<
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse
> = async ({input: {compositionId, defaultProps, enumPaths}, remotionRoot}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot);
		if (!projectInfo.videoFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.videoFile);

		const updated = await updateDefaultProps({
			compositionId,
			input: readFileSync(projectInfo.videoFile, 'utf-8'),
			newDefaultProps: JSON.parse(defaultProps),
			enumPaths,
		});

		writeFileSync(projectInfo.videoFile, updated);
		return {
			success: true,
		};
	} catch (err) {
		return {
			success: false,
			reason: (err as Error).message,
			stack: (err as Error).stack as string,
		};
	}
};
