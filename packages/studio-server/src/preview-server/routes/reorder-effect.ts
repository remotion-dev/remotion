import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	ReorderEffectRequest,
	ReorderEffectResponse,
} from '@remotion/studio-shared';
import {reorderEffect} from '../../codemods/reorder-effect';
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

export const reorderEffectHandler: ApiHandler<
	ReorderEffectRequest,
	ReorderEffectResponse
> = ({
	input: {fileName, sequenceNodePath, fromIndex, toIndex, clientId},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[reorder-effect] Received request for fileName="${fileName}" fromIndex=${fromIndex} toIndex=${toIndex}`,
			);

			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {output, formatted, effectLabel, logLine} = await reorderEffect({
				input: fileContents,
				sequenceNodePath: sequenceNodePath.nodePath,
				fromIndex,
				toIndex,
			});

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Reordering of ${effectLabel}`,
					redoMessage: `↪️  Reordering of ${effectLabel}`,
				},
				entryType: 'reorder-effect',
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
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Reordered ${attrName(effectLabel)}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[reorder-effect] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
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
