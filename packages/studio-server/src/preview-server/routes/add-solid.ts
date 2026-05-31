import {RenderInternals} from '@remotion/renderer';
import type {AddSolidRequest, AddSolidResponse} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {addSolidToComposition} from '../../helpers/resolve-composition-component';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSavePropsLock} from './save-props-mutex';

const validateDimension = (name: string, value: number) => {
	if (!Number.isFinite(value) || value < 1) {
		throw new Error(`${name} must be a positive number`);
	}
};

export const addSolidHandler: ApiHandler<AddSolidRequest, AddSolidResponse> = ({
	input: {compositionFile, compositionId, width, height},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		try {
			validateDimension('width', width);
			validateDimension('height', height);

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[add-solid] Received request for compositionFile="${compositionFile}" compositionId="${compositionId}"`,
			);

			const {fileName, source, oldContents, output, formatted, logLine} =
				await addSolidToComposition({
					remotionRoot,
					compositionFile,
					compositionId,
					width,
					height,
				});

			pushToUndoStack({
				filePath: fileName,
				oldContents,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: '↩️  Added <Solid>',
					redoMessage: '↪️  Added <Solid>',
				},
				entryType: 'add-solid',
				suppressHmrOnFileRestore: false,
			});
			suppressUndoStackInvalidation(fileName);
			writeFileAndNotifyFileWatchers(fileName, output, undefined);

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath: fileName,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Added <Solid>`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[add-solid] Wrote ${source}${formatted ? ' (formatted)' : ''}`,
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
