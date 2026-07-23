import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse,
} from '@remotion/studio-shared';
import {duplicateJsxNode} from '../../codemods/duplicate-jsx-node';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const duplicateJsxNodeHandler: ApiHandler<
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse
> = ({input: {fileName, nodePath}, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[duplicate-jsx-node] Received request for fileName="${fileName}"`,
			);
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');

			const {output, formatted, nodeLabel, logLine} = await duplicateJsxNode({
				input: fileContents,
				nodePath,
			});

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Duplication of ${nodeLabel}`,
					redoMessage: `↪️  Duplication of ${nodeLabel}`,
				},
				entryType: 'duplicate-jsx-node',
				suppressHmrOnFileRestore: false,
			});
			suppressUndoStackInvalidation(absolutePath);
			writeFileAndNotifyFileWatchers(absolutePath, output, undefined);

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Duplicated ${nodeLabel}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[duplicate-jsx-node] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
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
