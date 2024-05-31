import type {
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from '@remotion/studio-shared';
import {readFileSync, writeFileSync} from 'node:fs';
import {updateDefaultProps} from '../../codemods/update-default-props';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import {checkIfTypeScriptFile} from './can-update-default-props';

export const updateDefaultPropsHandler: ApiHandler<
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse
> = async ({input: {compositionId, defaultProps, enumPaths}, remotionRoot}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const updated = await updateDefaultProps({
			compositionId,
			input: readFileSync(projectInfo.rootFile, 'utf-8'),
			newDefaultProps: JSON.parse(defaultProps),
			enumPaths,
		});

		writeFileSync(projectInfo.rootFile, updated);
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
