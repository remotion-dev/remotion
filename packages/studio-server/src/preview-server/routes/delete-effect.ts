import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteEffectRequest,
	DeleteEffectResponse,
} from '@remotion/studio-shared';
import {deleteEffect} from '../../codemods/delete-effect';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-updates/log-update';

export const deleteEffectHandler: ApiHandler<
	DeleteEffectRequest,
	DeleteEffectResponse
> = async ({
	input: {fileName, sequenceNodePath, effectIndex},
	remotionRoot,
	logLevel,
}) => {
	try {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-effect] Received request for fileName="${fileName}" effectIndex=${effectIndex}`,
		);
		const absolutePath = path.resolve(remotionRoot, fileName);
		const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
		if (fileRelativeToRoot.startsWith('..')) {
			throw new Error('Cannot modify a file outside the project');
		}

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const {output, formatted, effectLabel, logLine} = await deleteEffect({
			input: fileContents,
			sequenceNodePath: sequenceNodePath.nodePath,
			effectIndex,
		});

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: `↩️  Deletion of ${effectLabel}`,
				redoMessage: `↪️  Deletion of ${effectLabel}`,
			},
			entryType: 'delete-effect',
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
			`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Deleted ${effectLabel}`,
		);
		if (!formatted) {
			warnAboutPrettierOnce(logLevel);
		}

		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			`[delete-effect] Wrote ${fileRelativeToRoot}${formatted ? ' (formatted)' : ''}`,
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
