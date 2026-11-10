import {
	closeSync,
	existsSync,
	lstatSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {CodemodsInternals} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	getMissingPackageDependencies,
	withRequiredAuxiliaryPackages,
	type ElementInstallExpectedFileState,
	type InsertElementRequest,
	type InsertElementResponse,
	type SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import {addCompositionToFile} from './codemods/add-composition-to-file';
import {
	getFileWatcherRegistry,
	writeFileAndNotifyFileWatchers,
} from './file-watcher';
import {getInstalledInstallablePackages} from './helpers/get-installed-installable-packages';
import {
	assertNoSymlinks,
	openFileForWritingWithoutSymlinks,
} from './helpers/open-file-for-writing-without-symlinks';
import {insertJsxElementIntoComposition} from './helpers/resolve-composition-component';
import {resolveFileInsideProject} from './helpers/resolve-file-inside-project';
import {formatLogFileLocation} from './preview-server/format-log-file-location';
import {getProjectInfo} from './preview-server/project-info';
import {checkIfTypeScriptFile} from './preview-server/routes/can-update-default-props';
import {downloadRemoteAssetBytes} from './preview-server/routes/download-remote-asset';
import {
	getElementInstallPlan,
	validateElementInstallPosition,
} from './preview-server/routes/element-install-plan';
import {installPackageDependencies} from './preview-server/routes/install-dependency';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './preview-server/routes/source-file-write-queue';
import {broadcastSequenceNodePathMutation} from './preview-server/sequence-node-path-mutation';
import {
	discardLastUndoEntryAfterFailedCommit,
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from './preview-server/undo-stack';
import {
	notifyBundlerOfFileChange,
	prepareBundlerForFileWrite,
} from './preview-server/watch-ignore-next-change';

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

export type InstallElementOptions = InsertElementRequest & {
	readonly remotionRoot: string;
	readonly entryPoint: string;
	readonly publicDir: string;
	readonly binariesDirectory: string | null;
	readonly logLevel: LogLevel;
	/**
	 * Install the Element's missing npm dependencies with the project's package
	 * manager before writing files. Remotion Studio installs them from the
	 * browser beforehand and passes `false`.
	 */
	readonly installDependencies: boolean;
	readonly packageManager: string | null;
	/**
	 * Whether the installation runs inside a Remotion Studio server. If so,
	 * files are written through the Studio file watchers and the installation is
	 * pushed onto the undo stack.
	 */
	readonly studio: boolean;
};

/**
 * Performs a complete Element installation from a validated Element payload:
 * downloads its assets into the public directory, installs its dependencies,
 * writes `<slug>.element.tsx` next to the target composition and inserts the
 * Element into the composition (or a new composition, or a caption target).
 */
export const installElement = async ({
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
	entryPoint,
	remotionRoot,
	logLevel,
	publicDir,
	binariesDirectory,
	installDependencies,
	packageManager,
	studio,
}: InstallElementOptions): Promise<InsertElementResponse> => {
	const writeSourceFile = ({
		file,
		content,
		metadata,
	}: {
		file: string;
		content: string;
		metadata: {skipSequencePropsUpdate: true} | null;
	}) => {
		if (studio) {
			writeFileAndNotifyFileWatchers({
				file,
				content,
				originatorClientId: undefined,
				metadata,
			});
		} else {
			writeFileSync(file, content);
		}
	};

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

		if (installDependencies) {
			const missingDependencies = getMissingPackageDependencies({
				dependencies: element.dependencies,
				installedPackages: getInstalledInstallablePackages(remotionRoot),
			});
			if (missingDependencies.length > 0) {
				await installPackageDependencies({
					logLevel,
					remotionRoot,
					dependencies: withRequiredAuxiliaryPackages(missingDependencies),
					packageManager,
					invalidateBundle: null,
				});
			}
		}
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

			const installationMode =
				element.installationMode === null
					? 'wrapped'
					: element.installationMode;
			const componentOwnsSequence =
				installationMode === 'component-owned-sequence';
			if (
				componentOwnsSequence &&
				element.initialProps !== null &&
				['from', 'durationInFrames', 'name'].some((prop) =>
					Object.hasOwn(element.initialProps ?? {}, prop),
				)
			) {
				throw new Error(
					'Component-owned Element initial props must not override from, durationInFrames, or name',
				);
			}

			if (
				componentOwnsSequence &&
				element.initialProps?.style !== undefined &&
				(element.initialProps.style === null ||
					typeof element.initialProps.style !== 'object' ||
					Array.isArray(element.initialProps.style))
			) {
				throw new Error(
					'Component-owned Element initial style must be an object',
				);
			}

			RenderInternals.Log.trace(
				{indent: false, logLevel},
				`[insert-element] Received request for compositionFile="${compositionFile}" compositionId="${compositionId}" element="${element.slug}"`,
			);

			let compositionCreation: {
				componentFilePath: string;
				componentFileContents: string;
				registrationFilePath: string;
				registrationFileOldContents: string;
				registrationFileNewContents: string;
			} | null = null;
			let sourceFileOverrides: ReadonlyMap<string, string> | null = null;

			if (newComposition !== null) {
				if (newComposition.options.newId !== compositionId) {
					throw new Error(
						'New composition ID does not match installation target',
					);
				}

				const registrationFilePath = newComposition.symbolicatedStack
					?.originalFileName
					? resolveFileInsideProject({
							remotionRoot,
							fileName: newComposition.symbolicatedStack.originalFileName,
							action: 'add a composition to',
						}).absolutePath
					: (await getProjectInfo(remotionRoot, entryPoint)).rootFile;
				if (registrationFilePath === null) {
					throw new Error('Cannot find file for composition in project');
				}

				checkIfTypeScriptFile(registrationFilePath);
				if (
					path.resolve(remotionRoot, compositionFile) !== registrationFilePath
				) {
					throw new Error(
						'New composition source does not match installation target',
					);
				}

				const componentFilePath = path.join(
					path.dirname(registrationFilePath),
					`${newComposition.options.componentName}.tsx`,
				);
				if (existsSync(componentFilePath)) {
					throw new Error(
						`Cannot create ${path.relative(
							remotionRoot,
							componentFilePath,
						)} because it already exists`,
					);
				}

				const registrationFileOldContents = readFileSync(
					registrationFilePath,
					'utf-8',
				);
				const codemodResult = await addCompositionToFile({
					filePath: registrationFilePath,
					options: newComposition.options,
					remotionRoot,
					publicDir,
					binariesDirectory,
				});
				const registrationFileNewContents =
					codemodResult.changes.find(
						(change) => change.filePath === registrationFilePath,
					)?.nextContents ?? registrationFileOldContents;
				const componentFileContents = codemodResult.changes.find(
					(change) => change.filePath === componentFilePath,
				)?.nextContents;

				if (
					componentFileContents === null ||
					componentFileContents === undefined
				) {
					throw new Error('Could not create the composition component');
				}

				compositionCreation = {
					componentFileContents,
					componentFilePath,
					registrationFileNewContents,
					registrationFileOldContents,
					registrationFilePath,
				};
				sourceFileOverrides = new Map([
					[registrationFilePath, registrationFileNewContents],
					[componentFilePath, componentFileContents],
				]);
			}

			const installDestination =
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
						: {
								type: 'new-composition' as const,
								compositionFile,
							};
			const plan = await getElementInstallPlan({
				installationName,
				destination: installDestination,
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
				plan.existingElementSource !== element.sourceCode;

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

			if (
				compositionCreation !== null &&
				plan.elementFileName ===
					path.join(
						path.dirname(plan.safePaths.compositionFileName),
						path.basename(compositionCreation.componentFilePath),
					)
			) {
				throw new Error(
					'Element source file conflicts with the new composition file',
				);
			}

			const shouldWriteElementFile =
				!plan.elementFileExists || elementSourcesDiffer;
			const initialProps = {...element.initialProps};
			if (componentOwnsSequence && element.dimensions !== null) {
				initialProps.style = {
					...element.dimensions,
					...(typeof initialProps.style === 'object' ? initialProps.style : {}),
				};
			}

			const insertionInput = {
				remotionRoot,
				compositionFile,
				compositionId,
				element: {
					type: 'component' as const,
					componentName: plan.componentName,
					importName: plan.componentName,
					importPath: plan.importPath,
					props: [
						...Object.entries(initialProps).map(([name, value]) => ({
							name,
							value,
						})),
						...(componentOwnsSequence && element.durationInFrames !== null
							? [
									{
										name: 'durationInFrames',
										value: element.durationInFrames,
									},
								]
							: []),
						...(componentOwnsSequence
							? [{name: 'name', value: element.displayName}]
							: []),
					],
					position: componentOwnsSequence ? position : null,
				},
				from: componentOwnsSequence ? from : null,
				prettierConfigOverride: null,
				wrapInSequence: componentOwnsSequence
					? null
					: {
							dimensions: element.dimensions,
							durationInFrames: element.durationInFrames,
							from,
							name: element.displayName,
							position,
						},
			};
			let inserted: {
				fileName: string;
				oldContents: string;
				output: string;
				logLine: number;
				nodePathRemappings: SequenceNodePathRemapping[];
			};
			if (captionTarget === null) {
				inserted = await insertJsxElementIntoComposition({
					...insertionInput,
					compositionFile,
					compositionId,
					sourceFileOverrides,
				});
			} else {
				const fileName = plan.safePaths.compositionFileName;
				const oldContents = readFileSync(fileName, 'utf-8');
				inserted = {
					...CodemodsInternals.insertBasicCaptions({
						...captionTarget,
						input: oldContents,
						importPath: plan.importPath,
						element: {componentName: plan.componentName, initialProps},
					}),
					fileName,
					oldContents,
				};
			}

			if (
				compositionCreation !== null &&
				inserted.fileName !== compositionCreation.componentFilePath
			) {
				throw new Error(
					'New composition component does not match installation target',
				);
			}

			const finalPlan = await getElementInstallPlan({
				installationName,
				destination: installDestination,
				element,
				entryPoint,
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

			if (
				compositionCreation !== null &&
				(readFileSync(compositionCreation.registrationFilePath, 'utf-8') !==
					compositionCreation.registrationFileOldContents ||
					existsSync(compositionCreation.componentFilePath))
			) {
				throw new Error(
					'Composition source changed during Element installation',
				);
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
					if (!lstatSync(absolutePath).isFile()) {
						throw new Error(
							`Asset ${asset.path} already exists and is not a file`,
						);
					}

					if (!readFileSync(absolutePath).equals(asset.contents)) {
						throw new Error(
							`Asset ${asset.path} already exists with different contents`,
						);
					}
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
						// Keep the original write error.
					}

					throw error;
				}

				closeSync(fileDescriptor);
				createdAssets.push(asset);
			}

			const nodePathMutation = broadcastSequenceNodePathMutation(
				[
					{
						absolutePath: inserted.fileName,
						remappings: inserted.nodePathRemappings,
					},
				],
				null,
			);

			const writeSource = ({
				content,
				file,
				metadata,
			}: {
				content: string;
				file: string;
				metadata: {skipSequencePropsUpdate: true} | null;
			}) => {
				const oldContents = existsSync(file)
					? readFileSync(file, 'utf8')
					: null;
				changedSources.push({
					filePath: file,
					newContents: content,
					oldContents,
				});
				writeSourceFile({file, content, metadata});
			};

			if (studio) {
				pushTransactionToUndoStack({
					snapshots: [
						...(compositionCreation === null
							? []
							: [
									{
										filePath: compositionCreation.registrationFilePath,
										oldContents:
											compositionCreation.registrationFileOldContents,
										newContents:
											compositionCreation.registrationFileNewContents,
										logLine:
											newComposition?.symbolicatedStack?.originalLineNumber ??
											1,
										nodePathRemappings: null,
									},
								]),
						...(shouldWriteElementFile
							? [
									{
										filePath: plan.elementFileName,
										oldContents: plan.existingElementSource,
										newContents: element.sourceCode,
										logLine: 1,
										nodePathRemappings: null,
									},
								]
							: []),
						{
							filePath: inserted.fileName,
							oldContents:
								compositionCreation === null ? inserted.oldContents : null,
							newContents: inserted.output,
							logLine: inserted.logLine,
							nodePathRemappings: inserted.nodePathRemappings,
						},
					],
					logLevel,
					remotionRoot,
					description:
						newComposition === null
							? {
									undoMessage: `↩️  Added ${element.displayName}`,
									redoMessage: `↪️  Added ${element.displayName}`,
								}
							: {
									undoMessage: `↩️  Installation of ${element.displayName} into composition "${compositionId}"`,
									redoMessage: `↪️  Installation of ${element.displayName} into composition "${compositionId}"`,
								},
					entryType: 'insert-composition-element',
					suppressHmrOnFileRestore: false,
					undoRedoNavigation,
				});
				undoEntryPushed = true;
				if (compositionCreation !== null) {
					suppressUndoStackInvalidation(
						compositionCreation.registrationFilePath,
					);
				}

				if (shouldWriteElementFile) {
					suppressUndoStackInvalidation(plan.elementFileName);
				}

				suppressUndoStackInvalidation(inserted.fileName);
			}

			if (compositionCreation !== null) {
				writeSource({
					file: compositionCreation.registrationFilePath,
					content: compositionCreation.registrationFileNewContents,
					metadata: null,
				});
			}

			if (shouldWriteElementFile) {
				writeSource({
					file: plan.elementFileName,
					content: element.sourceCode,
					metadata: null,
				});
			}

			writeSource({
				file: inserted.fileName,
				content: inserted.output,
				metadata: {skipSequencePropsUpdate: true},
			});

			if (newComposition !== null && compositionCreation !== null) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(
						formatLogFileLocation({
							remotionRoot,
							absolutePath: compositionCreation.registrationFilePath,
							line: newComposition.symbolicatedStack?.originalLineNumber ?? 1,
						}),
					)} Created composition "${compositionId}"`,
				);
			}

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
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(elementLocationLabel)} ${elementFileAction}`,
			);
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(compositionLocationLabel)} Added <${plan.componentName}>`,
			);
			if (studio) {
				printUndoHint(logLevel);
			}

			return {success: true, nodePathMutation};
		} catch (err) {
			if (undoEntryPushed) {
				discardLastUndoEntryAfterFailedCommit();
			}

			for (const source of changedSources.reverse()) {
				try {
					if (readFileSync(source.filePath, 'utf8') !== source.newContents) {
						continue;
					}

					if (source.oldContents === null) {
						if (studio) prepareBundlerForFileWrite(source.filePath, null);
						unlinkSync(source.filePath);
						if (studio) {
							getFileWatcherRegistry().recordSourceWrite(source.filePath, null);
							notifyBundlerOfFileChange(source.filePath, null);
						}
					} else {
						writeSourceFile({
							file: source.filePath,
							content: source.oldContents,
							metadata: null,
						});
					}
				} catch {
					// Preserve subsequent user changes and the original installation error.
				}
			}

			for (const asset of createdAssets.reverse()) {
				try {
					if (readFileSync(asset.absolutePath).equals(asset.contents)) {
						unlinkSync(asset.absolutePath);
					}
				} catch {
					// Preserve subsequent user changes and the original installation error.
				}
			}

			return {
				success: false,
				type: 'error',
				reason: (err as Error).message,
				stack: (err as Error).stack as string,
			};
		}
	});
};
