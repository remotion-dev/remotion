import {readFileSync} from 'node:fs';
import {setCompositionDefaultProps} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {
	checkIfTypeScriptFile,
	getDefaultPropsFile,
} from './can-update-default-props';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

export const updateDefaultPropsHandler: ApiHandler<
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse
> = ({
	input: {compositionId, defaultProps, enumPaths, symbolicatedStack},
	remotionRoot,
	entryPoint,
	logLevel,
}) => {
	return withSourceFileWriteQueue(async () => {
		try {
			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[update-default-props] Received request for compositionId="${compositionId}"`,
			);
			const compositionFile = await getDefaultPropsFile({
				symbolicatedStack,
				remotionRoot,
				entryPoint,
			});

			checkIfTypeScriptFile(compositionFile);

			const fileContents = readFileSync(compositionFile, 'utf-8');
			const result = setCompositionDefaultProps({
				project: {
					files: {[compositionFile]: fileContents},
					rootDir: remotionRoot,
				},
				compositionFile,
				compositionId,
				defaultProps: JSON.parse(defaultProps),
				enumPaths,
			});
			const {logLine} = result;
			const output = result.changes[0]?.nextContents ?? fileContents;

			pushToUndoStack({
				filePath: compositionFile,
				oldContents: fileContents,
				newContents: null,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  default props update for "${compositionId}"`,
					redoMessage: `↪️  default props update for "${compositionId}"`,
				},
				entryType: 'default-props',
				suppressHmrOnFileRestore: true,
				nodePathRemappings: null,
			});
			suppressUndoStackInvalidation(compositionFile);
			suppressBundlerUpdateForFile(compositionFile);
			writeFileAndNotifyFileWatchers({
				file: compositionFile,
				content: output,
				originatorClientId: undefined,
				metadata: null,
			});

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath: compositionFile,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Updated default props for "${compositionId}"`,
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
