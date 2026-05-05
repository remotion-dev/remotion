import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse,
} from '@remotion/studio-shared';
import {duplicateJsxNode} from '../../codemods/duplicate-jsx-node';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-update';

export const duplicateJsxNodeHandler: ApiHandler<
	DuplicateJsxNodeRequest,
	DuplicateJsxNodeResponse
> = async ({input: {fileName, nodePath}, remotionRoot, logLevel}) => {
	try {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[duplicate-jsx-node] Received request for fileName="${fileName}"`,
		);
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot modify a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {output, formatted, nodeLabel, logLine} = await duplicateJsxNode({
			input: fileContents,
			nodePath,
		});

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: `Undo: duplication of ${nodeLabel}`,
				redoMessage: `Redo: duplication of ${nodeLabel}`,
			},
			entryType: 'duplicate-jsx-node',
			suppressHmrOnFileRestore: false,
		});
		suppressUndoStackInvalidation(absolutePath);
		writeFileAndNotifyFileWatchers(absolutePath, output);

		const locationLabel = formatLogFileLocation({
			remotionRoot,
			absolutePath,
			line: logLine,
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			`${RenderInternals.chalk.blueBright(`${locationLabel}:`)} Duplicated ${nodeLabel}`,
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
};
