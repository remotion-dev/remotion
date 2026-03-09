import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from '@remotion/studio-shared';
import {updateDefaultProps} from '../../codemods/update-default-props';
import {makeHyperlink} from '../../hyperlinks/make-link';
import type {ApiHandler} from '../api-types';
import {suppressHmrForFile} from '../hmr-suppression';
import {getProjectInfo} from '../project-info';
import {pushToUndoStack, suppressUndoStackInvalidation} from '../undo-stack';
import {checkIfTypeScriptFile} from './can-update-default-props';
import {warnAboutPrettierOnce} from './log-update';

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

		const fileContents = readFileSync(projectInfo.rootFile, 'utf-8');
		const {output, formatted} = await updateDefaultProps({
			compositionId,
			input: fileContents,
			newDefaultProps: JSON.parse(defaultProps),
			enumPaths,
		});

		pushToUndoStack(projectInfo.rootFile, fileContents);
		suppressUndoStackInvalidation(projectInfo.rootFile);
		suppressHmrForFile(projectInfo.rootFile);
		writeFileSync(projectInfo.rootFile, output);

		const fileRelativeToRoot = path.relative(
			remotionRoot,
			projectInfo.rootFile,
		);
		const locationLabel = `${fileRelativeToRoot}`;
		const fileLink = makeHyperlink({
			url: `file://${projectInfo.rootFile}`,
			text: locationLabel,
			fallback: locationLabel,
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			`${RenderInternals.chalk.blueBright(`${fileLink}:`)} Updated default props for "${compositionId}"`,
		);
		if (!formatted) {
			warnAboutPrettierOnce(logLevel);
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
