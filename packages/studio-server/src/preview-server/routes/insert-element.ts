import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	type InsertElementRequest,
	type InsertElementResponse,
	type InsertableCompositionElementPosition,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {
	insertJsxElementIntoComposition,
	resolveCompositionComponentWithFile,
} from '../../helpers/resolve-composition-component';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {getSafeElementInstallPaths} from './safe-element-install-path';
import {withSourceFileWriteQueue} from './source-file-write-queue';

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

const withoutTsxExtension = (fileName: string) => {
	return fileName.replace(/\.tsx$/, '');
};

const normalizeSourceForComparison = (source: string) => {
	return source.replace(/\r\n/g, '\n').trim();
};

const makeRelativeImportPath = ({
	fromFile,
	toFile,
}: {
	fromFile: string;
	toFile: string;
}) => {
	const withoutExtension = withoutTsxExtension(toFile);
	let relative = path
		.relative(path.dirname(fromFile), withoutExtension)
		.split(path.sep)
		.join('/');

	if (!relative.startsWith('.')) {
		relative = `./${relative}`;
	}

	return relative;
};

const validateDimensions = (
	dimensions: InsertElementRequest['element']['dimensions'],
) => {
	if (dimensions === null) {
		return;
	}

	if (
		!Number.isFinite(dimensions.width) ||
		!Number.isFinite(dimensions.height) ||
		dimensions.width <= 0 ||
		dimensions.height <= 0
	) {
		throw new Error('Element dimensions must be positive finite numbers');
	}
};

const validateElement = (element: InsertElementRequest['element']) => {
	if (
		StudioProtocolInternals.makeElementFileNameFromSlug(element.slug) === null
	) {
		throw new Error(
			'Element slug must produce a safe lowercase .tsx file name',
		);
	}

	if (
		typeof element.sourceCode !== 'string' ||
		element.sourceCode.trim().length === 0 ||
		element.sourceCode.length > 200000
	) {
		throw new Error('Unsupported Element source code');
	}

	if (
		StudioProtocolInternals.getElementComponentNameFromSourceCode(
			element.sourceCode,
		) === null
	) {
		throw new Error('Element source must export exactly one named component');
	}

	validateDimensions(element.dimensions);
};

export const insertElementHandler: ApiHandler<
	InsertElementRequest,
	InsertElementResponse
> = ({
	input: {
		compositionFile,
		compositionId,
		element,
		from,
		position,
		overwriteExisting,
	},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		try {
			validateElement(element);
			validatePosition(position);
			if (
				from !== null &&
				(!Number.isInteger(from) || !Number.isFinite(from) || from < 0)
			) {
				throw new Error('from must be a non-negative integer');
			}

			const componentName =
				StudioProtocolInternals.getElementComponentNameFromSourceCode(
					element.sourceCode,
				);
			if (componentName === null) {
				throw new Error(
					'Element source must export exactly one named component',
				);
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[insert-element] Received request for compositionFile="${compositionFile}" compositionId="${compositionId}" element="${element.slug}"`,
			);

			const location = await resolveCompositionComponentWithFile({
				remotionRoot,
				compositionFile,
				compositionId,
			});
			if (!location.canAddSequence) {
				throw new Error(
					'Cannot insert Element into this composition component',
				);
			}

			const derivedElementFileName =
				StudioProtocolInternals.makeElementFileNameFromSlug(element.slug);
			if (derivedElementFileName === null) {
				throw new Error(
					'Element slug must produce a safe lowercase .tsx file name',
				);
			}

			const safePaths = await getSafeElementInstallPaths({
				compositionFileName: location.fileName,
				elementFileName: path.resolve(
					path.dirname(location.fileName),
					derivedElementFileName,
				),
				remotionRoot,
			});
			const {elementFileName} = safePaths;

			const elementFileExists = existsSync(elementFileName);
			const existingElementSource = elementFileExists
				? readFileSync(elementFileName, 'utf-8')
				: null;
			const elementSourcesDiffer =
				existingElementSource !== null &&
				normalizeSourceForComparison(existingElementSource) !==
					normalizeSourceForComparison(element.sourceCode);

			if (elementSourcesDiffer && !overwriteExisting) {
				return {
					success: false,
					type: 'file-conflict',
					conflict: {
						filePath: path
							.relative(safePaths.remotionRoot, elementFileName)
							.split(path.sep)
							.join('/'),
						existingSource: existingElementSource,
						incomingSource: element.sourceCode,
					},
				};
			}

			const shouldWriteElementFile = !elementFileExists || elementSourcesDiffer;

			const importPath = makeRelativeImportPath({
				fromFile: location.fileName,
				toFile: elementFileName,
			});

			const inserted = await insertJsxElementIntoComposition({
				remotionRoot,
				compositionFile,
				compositionId,
				element: {
					type: 'component',
					componentName,
					importName: componentName,
					importPath,
					props: [],
					position: null,
				},
				from: null,
				prettierConfigOverride: null,
				wrapInSequence: {
					dimensions: element.dimensions,
					from,
					name: element.displayName,
					position,
				},
			});

			const finalSafePaths = await getSafeElementInstallPaths({
				compositionFileName: inserted.fileName,
				elementFileName,
				remotionRoot,
			});
			if (
				finalSafePaths.compositionFileName !== safePaths.compositionFileName
			) {
				throw new Error(
					'Composition source changed during Element installation',
				);
			}

			pushTransactionToUndoStack({
				snapshots: [
					...(shouldWriteElementFile
						? [
								{
									filePath: elementFileName,
									oldContents: existingElementSource,
									newContents: element.sourceCode,
									logLine: 1,
								},
							]
						: []),
					{
						filePath: inserted.fileName,
						oldContents: inserted.oldContents,
						newContents: inserted.output,
						logLine: inserted.logLine,
					},
				],
				logLevel,
				remotionRoot,
				description: {
					undoMessage: `↩️  Added ${element.displayName}`,
					redoMessage: `↪️  Added ${element.displayName}`,
				},
				entryType: 'insert-jsx-element',
				suppressHmrOnFileRestore: false,
			});
			if (shouldWriteElementFile) {
				suppressUndoStackInvalidation(elementFileName);
			}

			suppressUndoStackInvalidation(inserted.fileName);

			if (shouldWriteElementFile) {
				writeFileAndNotifyFileWatchers(
					elementFileName,
					element.sourceCode,
					undefined,
				);
			}

			writeFileAndNotifyFileWatchers(
				inserted.fileName,
				inserted.output,
				undefined,
			);

			const compositionLocationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath: inserted.fileName,
				line: inserted.logLine,
			});
			const elementLocationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath: elementFileName,
				line: 1,
			});
			const elementFileAction = elementSourcesDiffer
				? 'Overwrote existing Element source'
				: elementFileExists
					? 'Reused existing Element source'
					: 'Created Element source';
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(elementLocationLabel)} ${elementFileAction}`,
			);
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(compositionLocationLabel)} Added <${componentName}>`,
			);
			if (!inserted.formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			printUndoHint(logLevel);

			return {
				success: true,
			};
		} catch (err) {
			return {
				success: false,
				type: 'error',
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});
