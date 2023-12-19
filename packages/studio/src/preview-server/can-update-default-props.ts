import {readFileSync} from 'node:fs';

import {updateDefaultProps} from '../codemods/update-default-props';
import {ApiHandler} from './api-types';
import {
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse,
} from './job';
import {getProjectInfo} from './project-info';

export const checkIfTypeScriptFile = (file: string) => {
	if (
		!file.endsWith('.tsx') &&
		!file.endsWith('.ts') &&
		!file.endsWith('.mtsx') &&
		!file.endsWith('.mts')
	) {
		throw new Error('Cannot update default props for non-TypeScript files');
	}
};

export const canUpdateDefaultPropsHandler: ApiHandler<
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse
> = async ({input: {compositionId}, remotionRoot}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot);
		if (!projectInfo.videoFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.videoFile);

		await updateDefaultProps({
			compositionId,
			input: readFileSync(projectInfo.videoFile, 'utf-8'),
			newDefaultProps: {},
			enumPaths: [],
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
