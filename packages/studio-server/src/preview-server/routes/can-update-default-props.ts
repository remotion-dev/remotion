import type {
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse,
} from '@remotion/studio-shared';
import {readFileSync} from 'node:fs';
import {updateDefaultProps} from '../../codemods/update-default-props';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';

export const checkIfTypeScriptFile = (file: string) => {
	if (
		!file.endsWith('.tsx') &&
		!file.endsWith('.ts') &&
		!file.endsWith('.mtsx') &&
		!file.endsWith('.mts')
	) {
		throw new Error('Cannot update Root file if not using TypeScript');
	}
};

export const canUpdateDefaultPropsHandler: ApiHandler<
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse
> = async ({input: {compositionId}, remotionRoot}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		await updateDefaultProps({
			compositionId,
			input: readFileSync(projectInfo.rootFile, 'utf-8'),
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
