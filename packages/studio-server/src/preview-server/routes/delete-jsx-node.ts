import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse,
} from '@remotion/studio-shared';
import {deleteJsxNode} from '../../codemods/delete-jsx-node';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-update';

export const deleteJsxNodeHandler: ApiHandler<
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse
> = async ({input: {fileName, nodePath}, remotionRoot, logLevel}) => {
	try {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-jsx-node] Received request for fileName="${fileName}"`,
		);
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot modify a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');

		const {output, formatted, nodeLabel, logLine} = await deleteJsxNode({
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
				undoMessage: `Undo: Deletion of ${nodeLabel}`,
				redoMessage: `Redo: Deletion of ${nodeLabel}`,
			},
			entryType: 'delete-jsx-node',
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
			`${RenderInternals.chalk.blueBright(`${locationLabel}:`)} Deleted ${nodeLabel}`,
		);
		if (!formatted) {
			warnAboutPrettierOnce(logLevel);
		}

		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			`[delete-jsx-node] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
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
