import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import {
	areComponentProps,
	isComponentIdentifier,
	isComponentImportPath,
	isUrl,
	type InsertJsxElementRequest,
	type InsertJsxElementResponse,
	type InsertableCompositionElementPosition,
	type InsertableCompositionElement,
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
import {withSourceFileWriteQueue} from './source-file-write-queue';

const validateDimension = (name: string, value: number) => {
	if (!Number.isFinite(value) || value < 1) {
		throw new Error(`${name} must be a positive number`);
	}
};

const validatePosition = (
	position: InsertableCompositionElementPosition | null,
) => {
	if (position === null) {
		return;
	}

	if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
		throw new Error('Position must be finite');
	}
};

const isInsideRemotionRoot = ({
	fileName,
	remotionRoot,
}: {
	fileName: string;
	remotionRoot: string;
}) => {
	const relativePath = path.relative(remotionRoot, fileName);
	return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
};

const hasParentDirectorySegment = (fileName: string) => {
	return fileName.split('/').includes('..');
};

const validateCompositionFile = ({
	compositionFile,
	remotionRoot,
}: {
	compositionFile: string;
	remotionRoot: string;
}) => {
	if (
		!compositionFile ||
		compositionFile.includes('\0') ||
		compositionFile.includes('\\') ||
		compositionFile.startsWith('/') ||
		hasParentDirectorySegment(compositionFile)
	) {
		throw new Error('Unsupported composition file');
	}

	const resolved = path.resolve(remotionRoot, compositionFile);
	if (!isInsideRemotionRoot({fileName: resolved, remotionRoot})) {
		throw new Error('Unsupported composition file');
	}
};

const validateElement = (
	element: InsertableCompositionElement,
	remotionRoot: string,
) => {
	validatePosition(element.position);

	if (element.type === 'solid') {
		validateDimension('width', element.width);
		validateDimension('height', element.height);
		return;
	}

	if (element.type === 'asset') {
		if (element.srcType === 'remote') {
			if (!isUrl(element.src)) {
				throw new Error('Remote asset source must be a URL');
			}
		} else if (!element.src || element.src.includes('\\')) {
			throw new Error('Asset path must be a static file path');
		}

		if (element.dimensions) {
			validateDimension('width', element.dimensions.width);
			validateDimension('height', element.dimensions.height);
		}

		return;
	}

	if (element.type === 'component') {
		if (!isComponentIdentifier(element.componentName)) {
			throw new Error('Unsupported component name');
		}

		if (!isComponentIdentifier(element.importName)) {
			throw new Error('Unsupported component import name');
		}

		if (!isComponentImportPath(element.importPath)) {
			throw new Error('Unsupported component import path');
		}

		if (!areComponentProps(element.props)) {
			throw new Error('Unsupported component props');
		}

		return;
	}

	if (element.type === 'composition') {
		if (typeof element.compositionId !== 'string' || !element.compositionId) {
			throw new Error('Unsupported composition ID');
		}

		if (typeof element.compositionFile !== 'string') {
			throw new Error('Unsupported composition file');
		}

		validateCompositionFile({
			compositionFile: element.compositionFile,
			remotionRoot,
		});

		validateDimension('width', element.width);
		validateDimension('height', element.height);
		validateDimension('durationInFrames', element.durationInFrames);

		const parsedProps: unknown = JSON.parse(
			element.serializedResolvedPropsWithCustomSchema,
		);
		if (
			typeof parsedProps !== 'object' ||
			parsedProps === null ||
			Array.isArray(parsedProps)
		) {
			throw new Error('Resolved composition props must be an object');
		}

		return;
	}

	throw new Error('Unsupported element type');
};

const getElementLabel = (element: InsertableCompositionElement) => {
	if (element.type === 'solid') {
		return '<Solid>';
	}

	if (element.type === 'asset') {
		if (element.assetType === 'image') {
			return '<Img>';
		}

		if (element.assetType === 'video') {
			return '<Video>';
		}

		if (element.assetType === 'gif') {
			return '<Gif>';
		}

		if (element.assetType === 'animated-image') {
			return '<AnimatedImage>';
		}

		if (element.assetType === 'audio') {
			return '<Audio>';
		}
	}

	if (element.type === 'component') {
		return `<${element.componentName}>`;
	}

	if (element.type === 'composition') {
		return `composition "${element.compositionId}"`;
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
	withSourceFileWriteQueue(async () => {
		try {
			validateElement(element, remotionRoot);
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
