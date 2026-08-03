import {RenderInternals} from '@remotion/renderer';
import type {
	ElementInstallExpectedFileState,
	InsertElementRequest,
	InsertElementResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {insertJsxElementIntoComposition} from '../../helpers/resolve-composition-component';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {
	getElementInstallPlan,
	normalizeElementSourceForComparison,
	validateElementInstallPosition,
} from './element-install-plan';
import {warnAboutPrettierOnce} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

const hasExpectedFileState = ({
	expected,
	actual,
}: {
	expected: ElementInstallExpectedFileState;
	actual: ElementInstallExpectedFileState;
}) => {
	if (expected.exists !== actual.exists) {
		return false;
	}

	if (!expected.exists) {
		return true;
	}

	if (!actual.exists) {
		return false;
	}

	return actual.sourceHash === expected.sourceHash;
};

export const insertElementHandler: ApiHandler<
	InsertElementRequest,
	InsertElementResponse
> = ({
	input: {
		compositionFile,
		compositionId,
		element,
		expectedFileState,
		from,
		position,
		overwriteExisting,
	},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		try {
			validateElementInstallPosition(position);
			if (
				from !== null &&
				(!Number.isInteger(from) || !Number.isFinite(from) || from < 0)
			) {
				throw new Error('from must be a non-negative integer');
			}

			const installationMode = element.installationMode ?? 'wrapped';
			const componentOwnsSequence =
				installationMode === 'component-owned-sequence';

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[insert-element] Received request for compositionFile="${compositionFile}" compositionId="${compositionId}" element="${element.slug}"`,
			);

			const plan = await getElementInstallPlan({
				compositionFile,
				compositionId,
				element,
				remotionRoot,
			});
			if (
				expectedFileState !== null &&
				!hasExpectedFileState({
					actual: plan.expectedFileState,
					expected: expectedFileState,
				})
			) {
				const {existingElementSource} = plan;
				if (existingElementSource !== null) {
					return {
						success: false,
						type: 'file-conflict',
						conflict: {
							filePath: plan.filePath,
							existingSource: existingElementSource,
							incomingSource: element.sourceCode,
						},
					};
				}

				throw new Error('Element source changed during installation');
			}

			const elementSourcesDiffer =
				plan.existingElementSource !== null &&
				normalizeElementSourceForComparison(plan.existingElementSource) !==
					normalizeElementSourceForComparison(element.sourceCode);

			if (
				elementSourcesDiffer &&
				!overwriteExisting &&
				plan.existingElementSource !== null
			) {
				return {
					success: false,
					type: 'file-conflict',
					conflict: {
						filePath: plan.filePath,
						existingSource: plan.existingElementSource,
						incomingSource: element.sourceCode,
					},
				};
			}

			const shouldWriteElementFile =
				!plan.elementFileExists || elementSourcesDiffer;
			const inserted = await insertJsxElementIntoComposition({
				remotionRoot,
				compositionFile,
				compositionId,
				element: {
					type: 'component',
					componentName: plan.componentName,
					importName: plan.componentName,
					importPath: plan.importPath,
					props: componentOwnsSequence
						? [
								...(element.durationInFrames === undefined
									? []
									: [
											{
												name: 'durationInFrames',
												value: element.durationInFrames,
											},
										]),
								{name: 'name', value: element.displayName},
							]
						: [],
					position: componentOwnsSequence ? position : null,
				},
				from: componentOwnsSequence ? from : null,
				prettierConfigOverride: null,
				wrapInSequence: componentOwnsSequence
					? null
					: {
							dimensions: element.dimensions,
							durationInFrames: element.durationInFrames ?? null,
							from,
							name: element.displayName,
							position,
						},
			});

			const finalPlan = await getElementInstallPlan({
				compositionFile,
				compositionId,
				element,
				remotionRoot,
			});
			if (
				finalPlan.safePaths.compositionFileName !==
				plan.safePaths.compositionFileName
			) {
				throw new Error(
					'Composition source changed during Element installation',
				);
			}

			if (
				!hasExpectedFileState({
					actual: finalPlan.expectedFileState,
					expected: plan.expectedFileState,
				})
			) {
				throw new Error('Element source changed during installation');
			}

			pushTransactionToUndoStack({
				snapshots: [
					...(shouldWriteElementFile
						? [
								{
									filePath: plan.elementFileName,
									oldContents: plan.existingElementSource,
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
				suppressUndoStackInvalidation(plan.elementFileName);
			}

			suppressUndoStackInvalidation(inserted.fileName);

			if (shouldWriteElementFile) {
				writeFileAndNotifyFileWatchers(
					plan.elementFileName,
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
				absolutePath: plan.elementFileName,
				line: 1,
			});
			const elementFileAction = elementSourcesDiffer
				? 'Overwrote existing Element source'
				: plan.elementFileExists
					? 'Reused existing Element source'
					: 'Created Element source';
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(elementLocationLabel)} ${elementFileAction}`,
			);
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${RenderInternals.chalk.blueBright(compositionLocationLabel)} Added <${plan.componentName}>`,
			);
			if (!inserted.formatted) {
				warnAboutPrettierOnce(logLevel);
			}

			printUndoHint(logLevel);

			return {success: true};
		} catch (err) {
			return {
				success: false,
				type: 'error',
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});
