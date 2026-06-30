import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse,
} from '@remotion/studio-shared';
import {splitJsxSequence} from '../../codemods/split-jsx-sequence';
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

export const splitJsxSequenceHandler: ApiHandler<
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse
> = ({input: {fileName, nodePath, splitFrame}, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[split-jsx-sequence] Received request for fileName="${fileName}" at frame ${splitFrame}`,
			);
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});

			const fileContents = readFileSync(absolutePath, 'utf-8');

			const {output, formatted, nodeLabel, logLine} = await splitJsxSequence({
				input: fileContents,
				nodePath,
				splitFrame,
			});

			pushToUndoStack({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Split of ${nodeLabel}`,
					redoMessage: `↪️  Split of ${nodeLabel}`,
				},
				entryType: 'split-jsx-sequence',
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
				`${RenderInternals.chalk.blueBright(
					`${locationLabel}`,
				)} Split ${nodeLabel}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[split-jsx-sequence] Wrote ${fileRelativeToRoot}${
					formatted ? ' (formatted)' : ''
				}`,
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
