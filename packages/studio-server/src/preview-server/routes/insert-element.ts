import {
	closeSync,
	existsSync,
	lstatSync,
	readFileSync,
	realpathSync,
	unlinkSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {CodemodsInternals} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import type {
	ElementInstallExpectedFileState,
	InsertElementRequest,
	InsertElementResponse,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {
	assertNoSymlinks,
	openFileForWritingWithoutSymlinks,
} from '../../helpers/open-file-for-writing-without-symlinks';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {getProjectInfo} from '../project-info';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	discardLastUndoEntryAfterFailedCommit,
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {checkIfTypeScriptFile} from './can-update-default-props';
import {downloadRemoteAssetBytes} from './download-remote-asset';
import {
	getElementInstallPlan,
	validateElementInstallPosition,
} from './element-install-plan';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

const hasExpectedFileState = ({
	expected,
	actual,
}: {
	expected: ElementInstallExpectedFileState;
	actual: ElementInstallExpectedFileState;
}) =>
	expected.exists === actual.exists &&
	(!expected.exists ||
		(actual.exists && actual.sourceHash === expected.sourceHash));

export const insertElementHandler: ApiHandler<
	InsertElementRequest,
	InsertElementResponse
> = async ({input, entryPoint, remotionRoot, logLevel, publicDir}) => {
	const {
		compositionFile,
		compositionId,
		captionTarget,
		element,
		installationName,
		expectedFileState,
		from,
		position,
		overwriteExisting,
		undoRedoNavigation,
		newComposition,
	} = input;
	let resolvedAssets: Array<{contents: Uint8Array; path: string}>;
	try {
		if (
			captionTarget !== null &&
			(element.isCaptionStyle !== true ||
				element.installationMode !== 'component-owned-sequence' ||
				newComposition !== null ||
				compositionFile !== null ||
				compositionId !== null)
		) {
			throw new Error('Invalid caption style installation target');
		}

		StudioProtocolInternals.assertElementAssets(element.assets);
		StudioProtocolInternals.assertElementAssetReferences(element);
		resolvedAssets = await StudioProtocolInternals.resolveElementAssets({
			assets: element.assets,
			downloadAsset: (options) =>
				downloadRemoteAssetBytes({...options, acceptHeader: null}),
		});
	} catch (err) {
		return {
			success: false,
			type: 'error',
			reason: (err as Error).message,
			stack: (err as Error).stack ?? '',
		};
	}

	return withSourceFileWriteQueue(async () => {
		const createdAssets: Array<{absolutePath: string; contents: Uint8Array}> =
			[];
		const changedSources: Array<{
			filePath: string;
			newContents: string;
			oldContents: string | null;
		}> = [];
		let undoEntryPushed = false;
		try {
			validateElementInstallPosition(position);
			if (
				from !== null &&
				(!Number.isInteger(from) || !Number.isFinite(from) || from < 0)
			) {
				throw new Error('from must be a non-negative integer');
			}

			if (
				newComposition !== null &&
				newComposition.options.newId !== compositionId
			) {
				throw new Error(
					'New composition ID does not match installation target',
				);
			}

			const destination =
				captionTarget !== null
					? {
							type: 'selected-media' as const,
							compositionFile: captionTarget.fileName,
						}
					: newComposition === null
						? {
								type: 'current-composition' as const,
								compositionFile,
								compositionId,
							}
						: {type: 'new-composition' as const, compositionFile};
			const plan = await getElementInstallPlan({
				installationName,
				destination,
				element,
				entryPoint,
				remotionRoot,
			});
			if (
				expectedFileState !== null &&
				!hasExpectedFileState({
					actual: plan.expectedFileState,
					expected: expectedFileState,
				})
			) {
				if (plan.existingElementSource !== null) {
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

				throw new Error('Element source changed during installation');
			}

			if (!overwriteExisting && plan.existingElementSource !== null) {
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

			const files: Record<string, string> = {
				[plan.safePaths.compositionFileName]: readFileSync(
					plan.safePaths.compositionFileName,
					'utf-8',
				),
			};
			if (plan.existingElementSource !== null)
				files[plan.elementFileName] = plan.existingElementSource;
			const fileAliases = new Map([
				[
					plan.safePaths.compositionFileName,
					plan.location?.fileName ?? plan.destinationCompositionFileName,
				],
			]);
			let changes: Array<{
				filePath: string;
				previousContents: string | null;
				nextContents: string | null;
			}>;
			let remappings: Array<{filePath: string} & SequenceNodePathRemapping>;
			let installedCompositionId: string | null = null;
			if (input.captionTarget === null) {
				const adapterFile = CodemodsInternals.getElementCompositionFilePath(
					plan.elementFileName,
				);
				assertNoSymlinks({
					absolutePath: adapterFile,
					rootDirectory: plan.safePaths.remotionRoot,
				});
				if (existsSync(adapterFile))
					files[adapterFile] = readFileSync(adapterFile, 'utf-8');
				let registrationFile = input.newComposition?.symbolicatedStack
					?.originalFileName
					? resolveFileInsideProject({
							remotionRoot,
							fileName: input.newComposition.symbolicatedStack.originalFileName,
							action: 'add a composition to',
						}).absolutePath
					: plan.destinationCompositionFileName;
				checkIfTypeScriptFile(registrationFile);
				assertNoSymlinks({
					absolutePath: registrationFile,
					rootDirectory: remotionRoot,
				});
				if (
					input.newComposition !== null &&
					registrationFile !== path.resolve(remotionRoot, input.compositionFile)
				) {
					throw new Error(
						'New composition source does not match installation target',
					);
				}

				fileAliases.set(realpathSync(registrationFile), registrationFile);
				registrationFile = realpathSync(registrationFile);
				files[registrationFile] = readFileSync(registrationFile, 'utf-8');
				// Include the root when known, so replacement can find an existing
				// registration even if this copy is now inserted into another scene.
				const {rootFile} = await getProjectInfo(remotionRoot, entryPoint);
				if (rootFile !== null && rootFile !== registrationFile) {
					const safeRootFile = resolveFileInsideProject({
						remotionRoot,
						fileName: rootFile,
						action: 'read composition registrations from',
					}).absolutePath;
					assertNoSymlinks({
						absolutePath: safeRootFile,
						rootDirectory: remotionRoot,
					});
					fileAliases.set(realpathSync(safeRootFile), safeRootFile);
					files[realpathSync(safeRootFile)] = readFileSync(
						safeRootFile,
						'utf-8',
					);
				}

				const result = CodemodsInternals.installElementComposition({
					project: {files, rootDir: plan.safePaths.remotionRoot},
					request: input,
					registrationFile,
					elementFile: plan.elementFileName,
					componentName: plan.componentName,
					target:
						plan.location === null
							? null
							: {
									filePath: plan.safePaths.compositionFileName,
									exportName: plan.location.exportName,
								},
				});
				changes = result.changes.map((change) => ({
					...change,
					filePath: fileAliases.get(change.filePath) ?? change.filePath,
				}));
				remappings = result.nodePathRemappings.map((entry) => ({
					...entry,
					filePath: fileAliases.get(entry.filePath) ?? entry.filePath,
				}));
				installedCompositionId = result.compositionId;
			} else {
				const initialProps = CodemodsInternals.getElementInitialProps(element);

				const fileName = plan.safePaths.compositionFileName;
				const result = CodemodsInternals.insertBasicCaptions({
					...input.captionTarget,
					input: files[fileName],
					importPath: plan.importPath,
					element: {componentName: plan.componentName, initialProps},
				});
				changes = [
					{
						filePath: fileName,
						previousContents: files[fileName],
						nextContents: result.output,
					},
					...(plan.existingElementSource === element.sourceCode
						? []
						: [
								{
									filePath: plan.elementFileName,
									previousContents: plan.existingElementSource,
									nextContents: element.sourceCode,
								},
							]),
				];
				remappings = result.nodePathRemappings.map((entry) => ({
					filePath: fileName,
					...entry,
				}));
			}

			const finalPlan = await getElementInstallPlan({
				installationName,
				destination,
				element,
				entryPoint,
				remotionRoot,
			});
			if (
				finalPlan.safePaths.compositionFileName !==
					plan.safePaths.compositionFileName ||
				!hasExpectedFileState({
					actual: finalPlan.expectedFileState,
					expected: plan.expectedFileState,
				})
			) {
				throw new Error('Source changed during Element installation');
			}

			for (const [file, contents] of Object.entries(files)) {
				if (readFileSync(file, 'utf-8') !== contents)
					throw new Error(
						'Composition source changed during Element installation',
					);
			}

			for (const change of changes) {
				const currentContents = existsSync(change.filePath)
					? readFileSync(change.filePath, 'utf-8')
					: null;
				if (currentContents !== change.previousContents) {
					throw new Error('Source changed during Element installation');
				}
			}

			const assetsToCreate: Array<{
				absolutePath: string;
				contents: Uint8Array;
			}> = [];
			for (const asset of resolvedAssets) {
				const absolutePath = path.resolve(publicDir, ...asset.path.split('/'));
				assertNoSymlinks({
					absolutePath,
					rootDirectory: path.resolve(publicDir),
				});
				if (existsSync(absolutePath)) {
					if (!lstatSync(absolutePath).isFile())
						throw new Error(
							`Asset ${asset.path} already exists and is not a file`,
						);
					if (!readFileSync(absolutePath).equals(asset.contents))
						throw new Error(
							`Asset ${asset.path} already exists with different contents`,
						);
				} else {
					assetsToCreate.push({absolutePath, contents: asset.contents});
				}
			}

			for (const asset of assetsToCreate) {
				const fileDescriptor = openFileForWritingWithoutSymlinks({
					absolutePath: asset.absolutePath,
					exclusive: true,
					rootDirectory: publicDir,
				});
				try {
					writeFileSync(fileDescriptor, asset.contents);
				} catch (error) {
					closeSync(fileDescriptor);
					try {
						unlinkSync(asset.absolutePath);
					} catch {
						/* Keep the original write error. */
					}

					throw error;
				}

				closeSync(fileDescriptor);
				createdAssets.push(asset);
			}

			const mutationFiles = [
				...new Set(remappings.map((entry) => entry.filePath)),
			].map((absolutePath) => ({
				absolutePath,
				remappings: remappings
					.filter((entry) => entry.filePath === absolutePath)
					.map(({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath})),
			}));
			const nodePathMutation = broadcastSequenceNodePathMutation(
				mutationFiles,
				null,
			);
			pushTransactionToUndoStack({
				snapshots: changes.map((change) => ({
					filePath: change.filePath,
					oldContents: change.previousContents,
					newContents: change.nextContents,
					logLine: 1,
					nodePathRemappings:
						mutationFiles.find((file) => file.absolutePath === change.filePath)
							?.remappings ?? null,
				})),
				logLevel,
				remotionRoot,
				description: {
					undoMessage: `↩️  Installation of ${element.displayName}`,
					redoMessage: `↪️  Installation of ${element.displayName}`,
				},
				entryType: 'insert-composition-element',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation,
			});
			undoEntryPushed = true;
			for (const change of changes)
				suppressUndoStackInvalidation(change.filePath);
			for (const change of changes) {
				if (change.nextContents === null)
					throw new Error('Element installation must not delete source files');
				changedSources.push({
					filePath: change.filePath,
					oldContents: change.previousContents,
					newContents: change.nextContents,
				});
				writeFileAndNotifyFileWatchers({
					file: change.filePath,
					content: change.nextContents,
					originatorClientId: undefined,
					metadata:
						change.filePath === plan.elementFileName
							? null
							: {skipSequencePropsUpdate: true},
				});
			}

			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(formatLogFileLocation({remotionRoot, absolutePath: plan.elementFileName, line: 1}))} Installed ${element.displayName}${installedCompositionId === null ? '' : ` as composition "${installedCompositionId}"`}`,
			);
			printUndoHint(logLevel);
			return {success: true, nodePathMutation};
		} catch (err) {
			if (undoEntryPushed) discardLastUndoEntryAfterFailedCommit();
			for (const source of changedSources.reverse()) {
				try {
					if (readFileSync(source.filePath, 'utf8') !== source.newContents)
						continue;
					if (source.oldContents === null) unlinkSync(source.filePath);
					else
						writeFileAndNotifyFileWatchers({
							file: source.filePath,
							content: source.oldContents,
							originatorClientId: undefined,
							metadata: null,
						});
				} catch {
					/* Preserve subsequent user changes and the original error. */
				}
			}

			for (const asset of createdAssets.reverse()) {
				try {
					if (readFileSync(asset.absolutePath).equals(asset.contents))
						unlinkSync(asset.absolutePath);
				} catch {
					/* Preserve subsequent user changes and the original error. */
				}
			}

			return {
				success: false,
				type: 'error',
				reason: (err as Error).message,
				stack: (err as Error).stack ?? '',
			};
		}
	});
};
