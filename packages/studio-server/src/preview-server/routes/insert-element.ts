import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import {
	isComponentIdentifier,
	makeElementFileNameFromSlug,
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
import {withSavePropsLock} from './save-props-mutex';

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

const isInside = ({child, parent}: {child: string; parent: string}) => {
	const relative = path.relative(parent, child);
	return (
		relative === '' ||
		(!relative.startsWith('..') && !path.isAbsolute(relative))
	);
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

const validateSourceExportsComponent = ({
	componentName,
	sourceCode,
}: {
	componentName: string;
	sourceCode: string;
}) => {
	const escaped = componentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const patterns = [
		new RegExp(`export\\s+const\\s+${escaped}\\b`),
		new RegExp(`export\\s+function\\s+${escaped}\\b`),
	];

	if (!patterns.some((pattern) => pattern.test(sourceCode))) {
		throw new Error(
			`Element source must export a named component called ${componentName}`,
		);
	}
};

const validateDimensions = (
	dimensions: InsertElementRequest['element']['dimensions'],
) => {
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
	if (!isComponentIdentifier(element.componentName)) {
		throw new Error('Unsupported Element component name');
	}

	if (makeElementFileNameFromSlug(element.slug) === null) {
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

	validateSourceExportsComponent({
		componentName: element.componentName,
		sourceCode: element.sourceCode,
	});
	validateDimensions(element.dimensions);
};

export const insertElementHandler: ApiHandler<
	InsertElementRequest,
	InsertElementResponse
> = ({
	input: {compositionFile, compositionId, element, position},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		try {
			validateElement(element);
			validatePosition(position);

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

			const derivedElementFileName = makeElementFileNameFromSlug(element.slug);
			if (derivedElementFileName === null) {
				throw new Error(
					'Element slug must produce a safe lowercase .tsx file name',
				);
			}

			const elementFileName = path.resolve(
				path.dirname(location.fileName),
				derivedElementFileName,
			);
			if (!isInside({child: elementFileName, parent: remotionRoot})) {
				throw new Error('Element file must stay inside the Remotion project');
			}

			const elementFileExists = existsSync(elementFileName);
			if (elementFileExists) {
				const existingSource = readFileSync(elementFileName, 'utf-8');
				if (
					normalizeSourceForComparison(existingSource) !==
					normalizeSourceForComparison(element.sourceCode)
				) {
					throw new Error(
						`Element file already exists with different contents: ${derivedElementFileName}`,
					);
				}
			}

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
					componentName: element.componentName,
					importName: element.componentName,
					importPath,
					props: [],
					position: null,
				},
				prettierConfigOverride: null,
				wrapInSequence: {
					dimensions: element.dimensions,
					position,
				},
			});

			pushTransactionToUndoStack({
				snapshots: [
					...(elementFileExists
						? []
						: [
								{
									filePath: elementFileName,
									oldContents: null,
									newContents: element.sourceCode,
									logLine: 1,
								},
							]),
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
			if (!elementFileExists) {
				suppressUndoStackInvalidation(elementFileName);
			}

			suppressUndoStackInvalidation(inserted.fileName);

			if (!elementFileExists) {
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
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(elementLocationLabel)} ${elementFileExists ? 'Reused existing Element source' : 'Created Element source'}`,
			);
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(compositionLocationLabel)} Added <${element.componentName}>`,
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
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});
