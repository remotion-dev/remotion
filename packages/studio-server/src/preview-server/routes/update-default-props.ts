import {readFileSync, writeFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from '@remotion/studio-shared';
import {updateDefaultProps} from '../../codemods/update-default-props';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import {checkIfTypeScriptFile} from './can-update-default-props';

let warnedAboutPrettier = false;

export const updateDefaultPropsHandler: ApiHandler<
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse
> = async ({
	input: {compositionId, defaultProps, enumPaths},
	remotionRoot,
	entryPoint,
	logLevel,
}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot, entryPoint);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const {output, formatted} = await updateDefaultProps({
			compositionId,
			input: readFileSync(projectInfo.rootFile, 'utf-8'),
			newDefaultProps: JSON.parse(defaultProps),
			enumPaths,
		});

		writeFileSync(projectInfo.rootFile, output);
		if (!formatted && !warnedAboutPrettier) {
			warnedAboutPrettier = true;
			RenderInternals.Log.warn(
				{indent: false, logLevel},
				RenderInternals.chalk.yellow(
					'Could not format the file using Prettier. Install "prettier" and add a config file to enable automatic formatting.',
				),
			);
		}

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
