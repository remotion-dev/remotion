import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	ReorderSequenceRequest,
	ReorderSequenceResponse,
} from '@remotion/studio-shared';
import {reorderSequence} from '../../codemods/reorder-sequence';
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

export const reorderSequenceHandler: ApiHandler<
	ReorderSequenceRequest,
	ReorderSequenceResponse
> = ({
	input: {fileName, sourceNodePath, targetNodePath, position, clientId},
	remotionRoot,
	logLevel,
}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[reorder-sequence] Received request for fileName="${fileName}" position=${position}`,
			);

			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {output, formatted, sequenceLabel, logLine} = await reorderSequence(
				{
					input: fileContents,
					sourceNodePath: sourceNodePath.nodePath,
					targetNodePath: targetNodePath.nodePath,
					position,
				},
			);

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Reordering of ${sequenceLabel}`,
					redoMessage: `↪️  Reordering of ${sequenceLabel}`,
				},
				entryType: 'reorder-sequence',
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
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Reordered ${attrName(sequenceLabel)}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[reorder-sequence] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
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
