import {readFileSync} from 'node:fs';
import {addEffect} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	AddEffectRequest,
	AddEffectResponse,
} from '@remotion/studio-shared';
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
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

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
			const result = await addEffect({
				project: {files: {[absolutePath]: fileContents}, rootDir: remotionRoot},
				node: {filePath: absolutePath, nodePath: sequenceNodePath.nodePath},
				importName: effectName,
				importPath: effectImportPath,
				props: effectConfig,
			});
			const output = result.project.files[absolutePath];
			const {formatted, effectLabel, nodeLabel, logLine} =
				result.editDetails[0];

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
				nodePathRemappings: null,
			});
			suppressUndoStackInvalidation(absolutePath);
			writeFileAndNotifyFileWatchers({
				file: absolutePath,
				content: output,
				originatorClientId: clientId,
				metadata: null,
			});

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Added ${attrName(effectLabel)} to ${nodeLabel}`,
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
