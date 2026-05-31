import {RenderInternals} from '@remotion/renderer';
import type {
	InsertJsxElementRequest,
	InsertJsxElementResponse,
	InsertableCompositionElement,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {insertJsxElementIntoComposition} from '../../helpers/resolve-composition-component';
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

const validateElement = (element: InsertableCompositionElement) => {
	if (element.type === 'solid') {
		validateDimension('width', element.width);
		validateDimension('height', element.height);
	}
};

const getElementLabel = (element: InsertableCompositionElement) => {
	if (element.type === 'solid') {
		return '<Solid>';
	}

	throw new Error('Unsupported element type');
};

export const insertJsxElementHandler: ApiHandler<
	InsertJsxElementRequest,
	InsertJsxElementResponse
> = ({
	input: {compositionFile, compositionId, element},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		try {
			validateElement(element);
			const elementLabel = getElementLabel(element);

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[insert-jsx-element] Received request for compositionFile="${compositionFile}" compositionId="${compositionId}" element="${element.type}"`,
			);

			const {fileName, source, oldContents, output, formatted, logLine} =
				await insertJsxElementIntoComposition({
					remotionRoot,
					compositionFile,
					compositionId,
					element,
					prettierConfigOverride: null,
				});

			pushToUndoStack({
				filePath: fileName,
				oldContents,
				newContents: output,
				logLevel,
				remotionRoot,
				logLine,
				description: {
					undoMessage: `↩️  Added ${elementLabel}`,
					redoMessage: `↪️  Added ${elementLabel}`,
				},
				entryType: 'insert-jsx-element',
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
				`${RenderInternals.chalk.blueBright(`${locationLabel}`)} Added ${elementLabel}`,
			);
			if (!formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`[insert-jsx-element] Wrote ${source}${formatted ? ' (formatted)' : ''}`,
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
