import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from '@remotion/studio-shared';
import {
	getCompositionDefaultPropsLine,
	updateDefaultProps,
} from '../../codemods/update-default-props';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {getProjectInfo} from '../project-info';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
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
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[update-default-props] Received request for compositionId="${compositionId}"`,
		);
		const projectInfo = await getProjectInfo(remotionRoot, entryPoint);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const fileContents = readFileSync(projectInfo.rootFile, 'utf-8');
		const logLine = getCompositionDefaultPropsLine({
			input: fileContents,
			compositionId,
		});
		const {output, formatted} = await updateDefaultProps({
			compositionId,
			input: fileContents,
			newDefaultProps: JSON.parse(defaultProps),
			enumPaths,
		});

		pushToUndoStack({
			filePath: projectInfo.rootFile,
			oldContents: fileContents,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: `Undo: default props update for "${compositionId}"`,
				redoMessage: `Redo: default props update for "${compositionId}"`,
			},
			entryType: 'default-props',
			suppressHmrOnFileRestore: true,
		});
		suppressUndoStackInvalidation(projectInfo.rootFile);
		suppressBundlerUpdateForFile(projectInfo.rootFile);
		writeFileAndNotifyFileWatchers(projectInfo.rootFile, output);

		const locationLabel = formatLogFileLocation({
			remotionRoot,
			absolutePath: projectInfo.rootFile,
			line: logLine,
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			`${RenderInternals.chalk.blueBright(`${locationLabel}:`)} Updated default props for "${compositionId}"`,
		);
		if (!formatted) {
			warnAboutPrettierOnce(logLevel);
		}

		printUndoHint(logLevel);

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
