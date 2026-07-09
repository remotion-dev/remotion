import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	AddEffectRequest,
	AddEffectResponse,
} from '@remotion/studio-shared';
import {addEffect} from '../../codemods/add-effect';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {attrName} from './log-updates/formatting';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const addEffectHandler: ApiHandler<
	AddEffectRequest,
	AddEffectResponse
> = ({
	input: {
		fileName,
		sequenceNodePath,
		effectName,
		effectImportPath,
		effectConfig,
		clientId,
	},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[add-effect] Received request for fileName="${fileName}" effect="${effectName}"`,
			);

			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {output, formatted, effectLabel, nodeLabel, logLine} =
				await addEffect({
					input: fileContents,
					sequenceNodePath: sequenceNodePath.nodePath,
					effectName,
					effectImportPath,
					effectConfig,
				});

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Addition of ${effectLabel} to ${nodeLabel}`,
					redoMessage: `↪️  Addition of ${effectLabel} to ${nodeLabel}`,
				},
				entryType: 'add-effect',
				suppressHmrOnFileRestore: false,
			});
			suppressUndoStackInvalidation(absolutePath);
			writeFileAndNotifyFileWatchers(absolutePath, output, clientId);

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Added ${attrName(effectLabel)} to ${nodeLabel}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[add-effect] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
			);

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
	});
};
