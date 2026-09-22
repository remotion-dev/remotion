import {
	CodemodsInternals,
	addComposition,
	addCanvasCaptureComposition,
	addEffect as addEffectCodemod,
	addFolder,
	addSolid,
	deleteComposition,
	deleteEffects as deleteEffectsCodemod,
	deleteJsxNodes as deleteJsxNodesCodemod,
	detachAudio,
	duplicateComposition as duplicateCompositionCodemod,
	duplicateEffects as duplicateEffectsCodemod,
	duplicateJsxNodes as duplicateJsxNodesCodemod,
	getJsxNodeProps,
	moveComposition,
	moveFolder,
	renameComposition,
	renameFolder,
	reorderEffect as reorderEffectCodemod,
	reorderJsxNode,
	resolveCompositionComponent,
	setCompositionDefaultProps,
	splitSequences,
	unwrapFolder,
	updateCompositionMetadata,
	updateEffectKeyframes,
	updateEffectProps as updateEffectPropsCodemod,
	updateJsxNodeKeyframes,
	type CodemodNodeResult,
	type CompositionDestination,
	type EffectKeyframeUpdate,
	type SequenceKeyframeUpdate,
} from '@remotion/codemods';
import {
	StudioProtocolInternals,
	type StudioElementPayload,
} from '@remotion/studio-protocol';
import {
	emptyCompositionComponent,
	getAllSchemaKeys,
	getRequiredPackageForEffectImportPath,
	getRequiredPackageForInsertableElement,
	type BrowserStudioEffectOperations,
	type BrowserStudioKeyframeOperations,
	type BrowserStudioOperations,
	type BrowserStudioPackageInstallationOperations,
	type ElementInstallExpectedFileState,
	type EventSourceEvent,
	type InsertElementResponse,
	type RecastCodemod,
	type SubscribeToSequencePropsRequest,
	type SubscribeToSequencePropsResponse,
	type SymbolicatedStackFrame,
	type UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';
import {format} from 'prettier/standalone';
import type {
	InteractivitySchema,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {
	createBrowserStudioProjectController,
	getCanonicalPublicFiles,
} from './browser-studio-project-controller';
import {makeBrowserStudioProjectArchive} from './download-project';
import {
	downloadRemoteAssetInBrowserStudio,
	fetchRemoteAssetBytesInBrowserStudio,
} from './download-remote-asset';
import {getBrowserStudioStoredPublicFile} from './opfs-public-files';
import {saveSequencePropsInProject} from './save-sequence-props';
import type {VirtualProject, VirtualProjectPublicFile} from './types';

const {
	basicCaptionsElementSource,
	computeSequencePropsSubscriptionFromContent,
	findProjectFile,
	getBasicCaptionsElementFile,
	lowerElementStaticFileRefs,
	lowerElementStaticFileRefs,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	getFolderFile,
	getRootFileForProject,
	insertBasicCaptions: insertBasicCaptionsCodemod,
	insertJsxElementIntoProjectWithNodePathRemappings,
	insertVideoLayers: insertVideoLayersCodemod,
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	pasteEffects: pasteEffectsCodemod,
	simpleDiff,
} = CodemodsInternals;

/*
 * SVG conversion uses SVGR in desktop Studio. SVGR depends on Node APIs, so
 * Browser Studio deliberately reports the unsupported operation instead.
 */
const svgMarkupToJsx = (): Promise<never> =>
	Promise.reject(
		new Error('Importing SVG markup is not supported in Browser Studio'),
	);

const formatCodemodFile = async ({contents}: {contents: string}) => ({
	formatted: true,
	output: await format(contents, {
		bracketSpacing: false,
		parser: 'typescript',
		plugins: [prettierPluginTypescript, prettierPluginEstree],
		singleQuote: true,
		useTabs: true,
	}),
});

const getNodePathMutationFiles = (result: CodemodNodeResult<VirtualProject>) =>
	[
		...new Set([
			...result.changes.map(({filePath}) => filePath),
			...result.nodePathRemappings.map(({filePath}) => filePath),
		]),
	].map((absolutePath) => ({
		absolutePath,
		remappings: result.nodePathRemappings
			.filter(({filePath}) => filePath === absolutePath)
			.map(({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath})),
	}));

const getStructuredError = (error: unknown) => ({
	success: false as const,
	reason: error instanceof Error ? error.message : String(error),
	stack: error instanceof Error && error.stack ? error.stack : '',
});

export type BrowserStudioOperationsController = BrowserStudioOperations & {
	emitEvent: (event: EventSourceEvent) => void;
	resetHistory: () => void;
};

type SuccessfulSequencePropsSubscription = Extract<
	SubscribeToSequencePropsResponse,
	{success: true}
>;

type SequencePropsSubscription = {
	request: SubscribeToSequencePropsRequest;
	result: SuccessfulSequencePropsSubscription;
	refCount: number;
	effectChain: string;
};

type ResolveElementDependencies = (
	dependencies: readonly {name: string; version: string | null}[],
) => Promise<Record<string, string>>;

type SequenceKeyframeMutation = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	schema: InteractivitySchema;
	updates: SequenceKeyframeUpdate[];
};

type EffectKeyframeMutation = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	schema: InteractivitySchema;
	updates: EffectKeyframeUpdate[];
};

type AppliedSequenceKeyframeMutation = SequenceKeyframeMutation & {
	absolutePath: string;
	updatedNodePath: SequenceNodePath;
};

type AppliedEffectKeyframeMutation = EffectKeyframeMutation & {
	absolutePath: string;
	updatedSequenceNodePath: SequenceNodePath;
};

const getEffectChain = (result: SuccessfulSequencePropsSubscription) =>
	result.status.effects
		.map((effect) => (effect.canUpdate ? effect.callee : false))
		.join(',');

const makeSequencePropsSubscriptionKey = ({
	clientId,
	fileName,
	nodePath,
	sequenceKeys,
	assetKeys,
	effectKeys,
}: UnsubscribeFromSequencePropsRequest) =>
	JSON.stringify({
		clientId,
		fileName,
		nodePath,
		sequenceKeys,
		assetKeys,
		effectKeys,
	});

const getElementSourceHash = async (source: string) => {
	const hash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(source),
	);
	return Array.from(new Uint8Array(hash), (byte) =>
		byte.toString(16).padStart(2, '0'),
	).join('');
};

const dirname = (filePath: string) => {
	const slash = filePath.replaceAll('\\', '/').lastIndexOf('/');
	return slash === -1 ? '' : filePath.slice(0, slash);
};

const relativeToRoot = (filePath: string, rootDir: string) => {
	const root = rootDir.replace(/\/$/, '');
	return filePath.startsWith(`${root}/`)
		? filePath.slice(root.length + 1)
		: filePath.replace(/^\//, '');
};

const getCodemodTargetCompositionId = (
	codemod: RecastCodemod,
): string | null => {
	if (codemod.type === 'duplicate-composition') {
		return codemod.idToDuplicate;
	}

	if (codemod.type === 'rename-composition') {
		return codemod.idToRename;
	}

	if (codemod.type === 'update-composition-metadata') {
		return codemod.idToUpdate;
	}

	if (codemod.type === 'delete-composition') {
		return codemod.idToDelete;
	}

	if (codemod.type === 'move-composition-to-folder') {
		return codemod.idToMove;
	}

	if (
		codemod.type === 'move-composition-or-folder' &&
		codemod.source.type === 'composition'
	) {
		return codemod.source.compositionId;
	}

	return null;
};

const resolveCodemodTargetFile = ({
	codemod,
	project,
	symbolicatedStack,
}: {
	codemod: RecastCodemod;
	project: VirtualProject;
	symbolicatedStack: SymbolicatedStackFrame | null;
}): string => {
	if (symbolicatedStack?.originalFileName) {
		return findProjectFile({
			filePath: symbolicatedStack.originalFileName,
			project,
		});
	}

	const compositionId = getCodemodTargetCompositionId(codemod);
	if (compositionId !== null) {
		const compositionFile = getCompositionFile({compositionId, project});
		if (compositionFile === null) {
			throw new Error(`Could not find composition "${compositionId}"`);
		}

		return findProjectFile({filePath: compositionFile, project});
	}

	if (codemod.type === 'rename-folder' || codemod.type === 'delete-folder') {
		const folderFile = getFolderFile({
			folderName: codemod.folderName,
			project,
		});
		if (folderFile === null) {
			throw new Error(`Could not find folder "${codemod.folderName}"`);
		}

		return findProjectFile({filePath: folderFile, project});
	}

	if (
		codemod.type === 'move-composition-or-folder' &&
		codemod.source.type === 'folder'
	) {
		const folderFile = getFolderFile({
			folderName: codemod.source.folderName,
			project,
		});
		if (folderFile === null) {
			throw new Error(`Could not find folder "${codemod.source.folderName}"`);
		}

		return findProjectFile({filePath: folderFile, project});
	}

	const rootFile = getRootFileForProject({
		entryPoint: project.entryPoint,
		project,
	});
	if (rootFile === null) {
		throw new Error('Could not find the root file of the project');
	}

	return findProjectFile({filePath: rootFile, project});
};

const applyCompositionCodemod = ({
	project,
	compositionFile,
	codemod,
}: {
	project: VirtualProject;
	compositionFile: string;
	codemod: RecastCodemod;
}): VirtualProject => {
	const target = {project, compositionFile};
	switch (codemod.type) {
		case 'new-composition': {
			const componentFilePath = `${dirname(compositionFile)}/${codemod.componentName}.tsx`;
			if (project.files[componentFilePath] !== undefined) {
				throw new Error(
					`Cannot create ${relativeToRoot(componentFilePath, project.rootDir)} because it already exists`,
				);
			}

			const composition = {
				...target,
				compositionId: codemod.newId,
				component: {
					filePath: componentFilePath,
					importName: codemod.componentName,
					importPath: codemod.componentImportPath,
				},
				metadata: {
					width: codemod.newWidth,
					height: codemod.newHeight,
					fps: codemod.newFps,
					durationInFrames: codemod.newDurationInFrames,
				},
				folder:
					codemod.folderName === null
						? undefined
						: {name: codemod.folderName, parentName: codemod.parentName},
			};
			if (codemod.canvasCapture !== null) {
				return addCanvasCaptureComposition({
					...composition,
					capture: codemod.canvasCapture,
				}).project;
			}

			const result = addComposition(composition).project;
			return {
				...result,
				files: {
					...result.files,
					[componentFilePath]: emptyCompositionComponent(codemod.componentName),
				},
			};
		}

		case 'duplicate-composition':
			return duplicateCompositionCodemod({
				...target,
				compositionId: codemod.idToDuplicate,
				newId: codemod.newId,
				tag: codemod.tag,
				metadata: {
					width: codemod.newWidth ?? undefined,
					height: codemod.newHeight ?? undefined,
					fps:
						codemod.tag === 'Still' ? undefined : (codemod.newFps ?? undefined),
					durationInFrames:
						codemod.tag === 'Still'
							? undefined
							: (codemod.newDurationInFrames ?? undefined),
				},
			}).project;
		case 'rename-composition':
			return renameComposition({
				...target,
				compositionId: codemod.idToRename,
				newId: codemod.newId,
			}).project;
		case 'delete-composition':
			return deleteComposition({...target, compositionId: codemod.idToDelete})
				.project;
		case 'update-composition-metadata':
			return updateCompositionMetadata({
				...target,
				compositionId: codemod.idToUpdate,
				metadata: {
					width: codemod.newWidth ?? undefined,
					height: codemod.newHeight ?? undefined,
					fps: codemod.newFps ?? undefined,
					durationInFrames: codemod.newDurationInFrames ?? undefined,
				},
			}).project;
		case 'new-folder':
			return addFolder({
				...target,
				folder: {name: codemod.folderName, parentName: codemod.parentName},
			}).project;
		case 'rename-folder':
			return renameFolder({
				...target,
				folder: {name: codemod.folderName, parentName: codemod.parentName},
				newName: codemod.newName,
			}).project;
		case 'delete-folder':
			return unwrapFolder({
				...target,
				folder: {name: codemod.folderName, parentName: codemod.parentName},
			}).project;
		case 'move-composition-to-folder':
			return moveComposition({
				...target,
				compositionId: codemod.idToMove,
				destination:
					codemod.folderName === null
						? {type: 'root'}
						: {
								type: 'folder',
								folder: {
									name: codemod.folderName,
									parentName: codemod.parentName,
								},
							},
			}).project;
		case 'move-composition-or-folder': {
			const destination: CompositionDestination =
				codemod.destination.type === 'folder'
					? {
							type: 'folder',
							folder: {
								name: codemod.destination.folderName,
								parentName: codemod.destination.parentName,
							},
						}
					: codemod.destination.type === 'root'
						? codemod.destination
						: {
								type: codemod.destination.type,
								target:
									codemod.destination.target.type === 'composition'
										? codemod.destination.target
										: {
												type: 'folder',
												name: codemod.destination.target.folderName,
												parentName: codemod.destination.target.parentName,
											},
							};
			return codemod.source.type === 'composition'
				? moveComposition({
						...target,
						compositionId: codemod.source.compositionId,
						destination,
					}).project
				: moveFolder({
						...target,
						folder: {
							name: codemod.source.folderName,
							parentName: codemod.source.parentName,
						},
						destination,
					}).project;
		}

		case 'apply-visual-control':
			throw new Error(
				'Applying visual controls is not supported in Browser Studio',
			);
		default:
			throw new Error('Unsupported codemod');
	}
};

const getElementInstallPlanForProject = async ({
	destination,
	element,
	installationName,
	project,
}: Parameters<BrowserStudioOperations['prepareElementInstall']>[0] & {
	project: VirtualProject;
}) => {
	const componentName =
		StudioProtocolInternals.getElementComponentNameFromSourceCode(
			element.sourceCode,
		);
	const elementFileName = StudioProtocolInternals.makeElementFileNameFromSlug(
		installationName ?? element.slug,
	);
	if (
		elementFileName === null ||
		(typeof installationName === 'string' &&
			elementFileName !== `${installationName}.element.tsx`)
	) {
		throw new Error(
			'Use a lowercase installation name with letters, numbers and hyphens, without a file extension.',
		);
	}

	if (componentName === null) {
		throw new Error('Invalid Element source');
	}

	const target =
		destination.type === 'current-composition'
			? resolveCompositionComponent({
					compositionFile: destination.compositionFile,
					compositionId: destination.compositionId,
					project,
				})
			: null;
	if (target !== null && !target.canAddContent) {
		throw new Error('Cannot insert Element into this composition component');
	}

	const rootFile =
		destination.type === 'new-composition' &&
		destination.compositionFile === null
			? getRootFileForProject({
					entryPoint: project.entryPoint,
					project,
				})
			: null;
	const compositionFile =
		destination.type === 'new-composition' &&
		destination.compositionFile === null
			? rootFile
			: destination.compositionFile;
	if (compositionFile === null) {
		throw new Error('Could not find the root file of the project');
	}

	const destinationCompositionFilePath = findProjectFile({
		filePath: compositionFile,
		project,
	});
	const elementSiblingFilePath =
		target?.filePath ?? destinationCompositionFilePath;
	const elementFilePath = `${dirname(elementSiblingFilePath)}/${elementFileName}`;
	if (elementFilePath === elementSiblingFilePath) {
		throw new Error('Element source file conflicts with the composition file');
	}

	const existingSource = project.files[elementFilePath] ?? null;
	const expectedFileState: ElementInstallExpectedFileState =
		existingSource === null
			? {exists: false}
			: {
					exists: true,
					sourceHash: await getElementSourceHash(existingSource),
				};

	return {
		componentName,
		destinationCompositionFilePath,
		elementFilePath,
		existingSource,
		expectedFileState,
		filePath: relativeToRoot(elementFilePath, project.rootDir),
		importPath: `./${elementFileName.replace(/\.tsx$/, '')}`,
	};
};

const expectedFileStateMatches = ({
	actual,
	expected,
}: {
	actual: ElementInstallExpectedFileState;
	expected: ElementInstallExpectedFileState;
}) => {
	if (actual.exists !== expected.exists) {
		return false;
	}

	return (
		!actual.exists ||
		(expected.exists && actual.sourceHash === expected.sourceHash)
	);
};

const addDependenciesToProject = ({
	dependencies,
	project,
}: {
	dependencies: Record<string, string>;
	project: VirtualProject;
}): VirtualProject => {
	if (Object.keys(dependencies).length === 0) {
		return project;
	}

	const root = project.rootDir.replace(/\/$/, '');
	const packageJsonPath =
		Object.keys(project.files).find(
			(file) => file.replaceAll('\\', '/') === `${root}/package.json`,
		) ?? `${root}/package.json`;
	const existing = project.files[packageJsonPath];
	const parsed = existing
		? (JSON.parse(existing) as Record<string, unknown>)
		: {name: 'remotion-browser-studio-project', private: true};
	const currentDependencies =
		typeof parsed.dependencies === 'object' && parsed.dependencies !== null
			? (parsed.dependencies as Record<string, string>)
			: {};
	parsed.dependencies = {...currentDependencies, ...dependencies};
	const indentation = existing?.match(/\n([ \t]+)"/)?.[1] ?? '  ';

	return {
		...project,
		files: {
			...project.files,
			[packageJsonPath]: `${JSON.stringify(parsed, null, indentation)}\n`,
		},
	};
};

export const createBrowserStudioOperations = ({
	dependencyVersions,
	getStaticFiles,
	getProject,
	initialElement,
	onProjectChange,
	resolveDependencies,
}: {
	dependencyVersions: Record<string, string>;
	getStaticFiles: Parameters<
		typeof createBrowserStudioProjectController
	>[0]['getStaticFiles'];
	getProject: () => VirtualProject;
	initialElement: {
		payload: StudioElementPayload;
		sourceOrigin: string | null;
	} | null;
	onProjectChange: (project: VirtualProject) => void;
	resolveDependencies: ResolveElementDependencies | null;
}): BrowserStudioOperationsController => {
	let pendingInitialElement = initialElement;
	const defaultPropsSubscriptions = new Map<string, Set<string>>();
	const lastDefaultPropsResults = new Map<string, string>();
	const sequencePropsSubscriptions = new Map<
		string,
		SequencePropsSubscription
	>();
	let refreshDefaultPropsSubscriptions = () => undefined;
	let refreshSequencePropsSubscriptions = () => undefined;
	const controller = createBrowserStudioProjectController({
		getStaticFiles,
		getProject,
		onProjectChange: (project, metadata) => {
			onProjectChange(project);
			refreshDefaultPropsSubscriptions();
			if (!metadata.skipSequencePropsUpdate) {
				refreshSequencePropsSubscriptions();
			}
		},
	});

	const mutateKeyframesInProject = async ({
		project,
		sequenceMutations,
		effectMutations,
	}: {
		project: VirtualProject;
		sequenceMutations: SequenceKeyframeMutation[];
		effectMutations: EffectKeyframeMutation[];
	}) => {
		if (sequenceMutations.length === 0 && effectMutations.length === 0) {
			throw new Error('No keyframe changes were specified');
		}

		const mergeUpdates = <T extends SequenceKeyframeUpdate>(updates: T[]) => {
			const merged: T[] = [];
			for (const update of updates) {
				const existingMove = merged.find(
					(candidate) =>
						candidate.key === update.key &&
						candidate.operation.type === 'move' &&
						update.operation.type === 'move',
				);
				if (
					existingMove?.operation.type === 'move' &&
					update.operation.type === 'move'
				) {
					existingMove.operation.moves.push(...update.operation.moves);
				} else {
					merged.push(update);
				}
			}

			return merged;
		};

		const mergedSequenceMutations = [
			...sequenceMutations
				.reduce((groups, mutation) => {
					const key = `${mutation.fileName}:${JSON.stringify(mutation.nodePath.nodePath)}`;
					const existing = groups.get(key);
					if (existing) {
						existing.updates.push(...mutation.updates);
					} else {
						groups.set(key, {...mutation, updates: [...mutation.updates]});
					}

					return groups;
				}, new Map<string, SequenceKeyframeMutation>())
				.values(),
		].map((mutation) => ({
			...mutation,
			updates: mergeUpdates(mutation.updates),
		}));
		const mergedEffectMutations = [
			...effectMutations
				.reduce((groups, mutation) => {
					const key = `${mutation.fileName}:${JSON.stringify(mutation.sequenceNodePath.nodePath)}:${mutation.effectIndex}`;
					const existing = groups.get(key);
					if (existing) {
						existing.updates.push(...mutation.updates);
					} else {
						groups.set(key, {...mutation, updates: [...mutation.updates]});
					}

					return groups;
				}, new Map<string, EffectKeyframeMutation>())
				.values(),
		].map((mutation) => ({
			...mutation,
			updates: mergeUpdates(mutation.updates),
		}));

		let nextProject = project;
		const appliedSequenceMutations: AppliedSequenceKeyframeMutation[] = [];
		const appliedEffectMutations: AppliedEffectKeyframeMutation[] = [];

		for (const mutation of mergedSequenceMutations) {
			const absolutePath = findProjectFile({
				filePath: mutation.fileName,
				project,
			});
			const result = await updateJsxNodeKeyframes({
				project: nextProject,
				node: {filePath: absolutePath, nodePath: mutation.nodePath.nodePath},
				updates: mutation.updates,
				schema: mutation.schema,
				videoConfig: mutation.nodePath.videoConfigValues ?? undefined,
			});
			nextProject = result.project;
			appliedSequenceMutations.push({
				...mutation,
				absolutePath,
				updatedNodePath: result.updatedNode.nodePath,
			});
		}

		for (const mutation of mergedEffectMutations) {
			const absolutePath = findProjectFile({
				filePath: mutation.fileName,
				project,
			});
			const result = await updateEffectKeyframes({
				project: nextProject,
				effect: {
					filePath: absolutePath,
					nodePath: mutation.sequenceNodePath.nodePath,
					effectIndex: mutation.effectIndex,
				},
				updates: mutation.updates,
				schema: mutation.schema,
				videoConfig: mutation.sequenceNodePath.videoConfigValues ?? undefined,
			});
			nextProject = result.project;
			appliedEffectMutations.push({
				...mutation,
				absolutePath,
				updatedSequenceNodePath: result.updatedEffect.nodePath,
			});
		}

		return {
			project: nextProject,
			appliedSequenceMutations,
			appliedEffectMutations,
		};
	};

	const commitKeyframeMutations = async ({
		label,
		sequenceMutations,
		effectMutations,
	}: {
		label: string;
		sequenceMutations: SequenceKeyframeMutation[];
		effectMutations: EffectKeyframeMutation[];
	}) => {
		const project = getProject();
		const result = await mutateKeyframesInProject({
			project,
			sequenceMutations,
			effectMutations,
		});
		controller.applyMutation({
			undoRedoNavigation: null,
			timelineSelection: null,
			fileName: label,
			mutate: () => result.project,
			nodePathMutationFiles: null,
		});
		return result;
	};

	const getSequenceKeyframeResponse = ({
		mutation,
		project,
	}: {
		mutation: AppliedSequenceKeyframeMutation;
		project: VirtualProject;
	}) => {
		const status = getJsxNodeProps({
			project,
			node: {
				filePath: mutation.absolutePath,
				nodePath: mutation.updatedNodePath,
			},
			componentIdentity: null,
			keys: getAllSchemaKeys(mutation.schema),
			effectKeys: [],
			videoConfig: mutation.nodePath.videoConfigValues ?? undefined,
		});
		const nodePath = {
			...mutation.nodePath,
			absolutePath: mutation.absolutePath,
			nodePath: mutation.updatedNodePath,
		};

		return {
			canUpdate: true as const,
			props: status.props,
			results: [{fileName: mutation.fileName, nodePath, props: status.props}],
		};
	};

	const getEffectKeyframeResponse = ({
		mutation,
		project,
	}: {
		mutation: AppliedEffectKeyframeMutation;
		project: VirtualProject;
	}) => {
		const effects = Array.from({length: mutation.effectIndex + 1}, (_, index) =>
			index === mutation.effectIndex ? getAllSchemaKeys(mutation.schema) : [],
		);
		const status = getJsxNodeProps({
			project,
			node: {
				filePath: mutation.absolutePath,
				nodePath: mutation.updatedSequenceNodePath,
			},
			componentIdentity: null,
			keys: [],
			effectKeys: effects,
			videoConfig: mutation.sequenceNodePath.videoConfigValues ?? undefined,
		});

		return (
			status.effects[mutation.effectIndex] ?? {
				canUpdate: false as const,
				effectIndex: mutation.effectIndex,
				reason: 'not-found' as const,
			}
		);
	};

	const getDefaultPropsStatus = (compositionId: string) =>
		getCanUpdateDefaultPropsForProject({
			compositionId,
			project: getProject(),
		});

	refreshDefaultPropsSubscriptions = () => {
		for (const compositionId of defaultPropsSubscriptions.keys()) {
			const result = getDefaultPropsStatus(compositionId);
			const serialized = JSON.stringify(result);
			if (lastDefaultPropsResults.get(compositionId) === serialized) {
				continue;
			}

			lastDefaultPropsResults.set(compositionId, serialized);
			controller.emitEvent({
				type: 'default-props-updatable-changed',
				compositionId,
				result,
			});
		}
	};

	const getSequencePropsSubscription = (
		request: SubscribeToSequencePropsRequest,
	): SubscribeToSequencePropsResponse => {
		try {
			const project = getProject();
			const absolutePath = findProjectFile({
				filePath: request.fileName,
				project,
			});
			return computeSequencePropsSubscriptionFromContent({
				fileContents: project.files[absolutePath],
				absolutePath,
				line: request.line,
				preferredNodePath: request.nodePath,
				componentIdentity: request.componentIdentity,
				keys: request.keys,
				assetKeys: request.assetKeys,
				effects: request.effects,
				videoConfigValues: request.videoConfigValues,
			});
		} catch {
			return {
				success: false,
				status: {canUpdate: false, reason: 'error'},
			};
		}
	};

	refreshSequencePropsSubscriptions = () => {
		for (const subscription of sequencePropsSubscriptions.values()) {
			const {request, result} = subscription;
			try {
				const project = getProject();
				const absolutePath = findProjectFile({
					filePath: request.fileName,
					project,
				});
				const nextStatus = getJsxNodeProps({
					project,
					node: {filePath: absolutePath, nodePath: result.nodePath.nodePath},
					componentIdentity: request.componentIdentity,
					keys: request.keys,
					assetKeys: request.assetKeys,
					effectKeys: request.effects,
					videoConfig: request.videoConfigValues ?? undefined,
				});
				const nextEffectChain = nextStatus.effects
					.map((effect) => (effect.canUpdate ? effect.callee : false))
					.join(',');
				if (nextEffectChain !== subscription.effectChain) {
					continue;
				}

				controller.emitEvent({
					type: 'sequence-props-updated',
					fileName: request.fileName,
					nodePath: result.nodePath,
					result: nextStatus,
				});
			} catch (error) {
				if (
					error instanceof JsxElementNotFoundAtLocationError ||
					error instanceof JsxElementIdentityMismatchError
				) {
					controller.emitEvent({
						type: 'lost-node-path',
						fileName: request.fileName,
						line: request.line,
						column: request.column,
					});
				}
			}
		}
	};

	const resolveElementDependencies = async (
		dependencies: readonly {name: string; version: string | null}[],
	) => {
		const resolved =
			resolveDependencies !== null
				? await resolveDependencies(dependencies)
				: {};
		const remotionVersion = dependencyVersions.remotion;

		for (const dependency of dependencies) {
			if (dependency.name.startsWith('@remotion/')) {
				if (!remotionVersion) {
					throw new Error(
						`Cannot resolve ${dependency.name} because the Browser Studio Remotion version is unavailable`,
					);
				}

				resolved[dependency.name] = remotionVersion;
				continue;
			}

			if (dependency.version === null) {
				throw new Error(`Could not resolve ${dependency.name}`);
			}

			resolved[dependency.name] ??= dependency.version;
		}

		return resolved;
	};

	const getEffectStatus = ({
		effectIndex,
		fileName,
		project,
		schema,
		sequenceNodePath,
	}: {
		effectIndex: number;
		fileName: string;
		project: VirtualProject;
		schema: InteractivitySchema;
		sequenceNodePath: SequencePropsSubscriptionKey;
	}) => {
		const absolutePath = findProjectFile({filePath: fileName, project});
		const status = getJsxNodeProps({
			project,
			node: {filePath: absolutePath, nodePath: sequenceNodePath.nodePath},
			componentIdentity: null,
			keys: [],
			effectKeys: Array.from({length: effectIndex + 1}, (_, index) =>
				index === effectIndex ? getAllSchemaKeys(schema) : [],
			),
			videoConfig: sequenceNodePath.videoConfigValues ?? undefined,
		});
		return (
			status.effects[effectIndex] ?? {
				canUpdate: false as const,
				effectIndex,
				reason: 'not-found' as const,
			}
		);
	};

	const effectOperations: BrowserStudioEffectOperations = {
		addEffect: async (request) => {
			try {
				const requiredPackage = getRequiredPackageForEffectImportPath(
					request.effectImportPath,
				);
				const dependencies =
					requiredPackage === null
						? {}
						: await resolveElementDependencies([
								{name: requiredPackage, version: null},
							]);
				const project = addDependenciesToProject({
					dependencies,
					project: getProject(),
				});
				const absolutePath = findProjectFile({
					filePath: request.fileName,
					project,
				});
				const result = await addEffectCodemod({
					project,
					props: request.effectConfig,
					importPath: request.effectImportPath,
					importName: request.effectName,
					node: {
						filePath: absolutePath,
						nodePath: request.sequenceNodePath.nodePath,
					},
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: absolutePath,
					nodePathMutationFiles: null,
					mutate: () => result.project,
				});
				return {success: true};
			} catch (error) {
				return getStructuredError(error);
			}
		},
		deleteEffects: async (request) => {
			try {
				if (request.length === 0) {
					throw new Error('No effects were specified for deletion');
				}

				const project = getProject();
				const result = await deleteEffectsCodemod({
					project,
					effects: request.map((item) => ({
						filePath: item.fileName,
						nodePath: item.sequenceNodePath.nodePath,
						effectIndex:
							item.type === 'single-effect' ? item.effectIndex : null,
					})),
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: result.changes.map(({filePath}) => filePath).join(', '),
					nodePathMutationFiles: null,
					mutate: () => result.project,
				});
				return {success: true};
			} catch (error) {
				return getStructuredError(error);
			}
		},
		duplicateEffects: async (request) => {
			try {
				if (request.length === 0) {
					throw new Error('No effects were specified for duplication');
				}

				const project = getProject();
				const result = await duplicateEffectsCodemod({
					project,
					effects: request.map((item) => ({
						filePath: item.fileName,
						nodePath: item.sequenceNodePath.nodePath,
						effectIndex: item.effectIndex,
					})),
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: result.changes.map(({filePath}) => filePath).join(', '),
					nodePathMutationFiles: null,
					mutate: () => result.project,
				});
				return {success: true};
			} catch (error) {
				return getStructuredError(error);
			}
		},
		pasteEffects: async (request) => {
			try {
				const packageNames = new Set(
					request.effects.flatMap((effect) => {
						const packageName = getRequiredPackageForEffectImportPath(
							effect.importPath,
						);
						return packageName === null ? [] : [packageName];
					}),
				);
				const dependencies = await resolveElementDependencies(
					[...packageNames].map((name) => ({name, version: null})),
				);
				const project = addDependenciesToProject({
					dependencies,
					project: getProject(),
				});
				const absolutePath = findProjectFile({
					filePath: request.targetFileName,
					project,
				});
				const result = await pasteEffectsCodemod({
					effects: request.effects,
					input: project.files[absolutePath],
					insertAtIndices: request.insertAtIndices,
					targetSequenceNodePath: request.targetSequenceNodePath.nodePath,
					type: request.type,
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: absolutePath,
					nodePathMutationFiles: null,
					mutate: () => ({
						...project,
						files: {...project.files, [absolutePath]: result.output},
					}),
				});
				return {success: true};
			} catch (error) {
				return getStructuredError(error);
			}
		},
		reorderEffect: async (request) => {
			try {
				const project = getProject();
				const absolutePath = findProjectFile({
					filePath: request.fileName,
					project,
				});
				const result = await reorderEffectCodemod({
					project,
					effect: {
						filePath: absolutePath,
						nodePath: request.sequenceNodePath.nodePath,
						effectIndex: request.fromIndex,
					},
					toIndex: request.toIndex,
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: absolutePath,
					nodePathMutationFiles: null,
					mutate: () => result.project,
				});
				return {success: true};
			} catch (error) {
				return getStructuredError(error);
			}
		},
		saveEffectProps: async (request) => {
			const project = getProject();
			const absolutePath = findProjectFile({
				filePath: request.fileName,
				project,
			});
			const result = await updateEffectPropsCodemod({
				project,
				effect: {
					filePath: absolutePath,
					nodePath: request.sequenceNodePath.nodePath,
					effectIndex: request.effectIndex,
				},
				schema: request.schema,
				updates: [
					request.type === 'effect-param'
						? {
								defaultValue:
									request.defaultValue === null
										? null
										: JSON.parse(request.defaultValue),
								effectParam: request.effectParam,
								key: request.key,
							}
						: {
								defaultValue:
									request.defaultValue === null
										? null
										: JSON.parse(request.defaultValue),
								key: request.key,
								value: JSON.parse(request.value),
							},
				],
			});
			const nextProject = result.project;
			controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: absolutePath,
				nodePathMutationFiles: null,
				mutate: () => nextProject,
			});
			return getEffectStatus({
				effectIndex: request.effectIndex,
				fileName: request.fileName,
				project: nextProject,
				schema: request.schema,
				sequenceNodePath: request.sequenceNodePath,
			});
		},
		saveMultipleEffectProps: async (request) => {
			if (request.edits.length === 0) {
				throw new Error('No effect prop edits to save');
			}

			const project = getProject();
			let nextProject = project;
			for (const edit of request.edits) {
				const absolutePath = findProjectFile({
					filePath: edit.fileName,
					project,
				});
				const result = await updateEffectPropsCodemod({
					project: nextProject,
					effect: {
						filePath: absolutePath,
						nodePath: edit.sequenceNodePath.nodePath,
						effectIndex: edit.effectIndex,
					},
					schema: edit.schema,
					updates: [
						edit.type === 'effect-param'
							? {
									defaultValue:
										edit.defaultValue === null
											? null
											: JSON.parse(edit.defaultValue),
									effectParam: edit.effectParam,
									key: edit.key,
								}
							: {
									defaultValue:
										edit.defaultValue === null
											? null
											: JSON.parse(edit.defaultValue),
									key: edit.key,
									value: JSON.parse(edit.value),
								},
					],
				});
				nextProject = result.project;
			}

			controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: request.undoLabel,
				nodePathMutationFiles: null,
				mutate: () => nextProject,
			});
			const targets = [
				...new Map(
					request.edits.map((edit) => [
						JSON.stringify([
							edit.fileName,
							edit.sequenceNodePath.nodePath,
							edit.effectIndex,
						]),
						edit,
					]),
				).values(),
			];
			return {
				results: targets.map((edit) => ({
					fileName: edit.fileName,
					sequenceNodePath: edit.sequenceNodePath,
					status: getEffectStatus({
						effectIndex: edit.effectIndex,
						fileName: edit.fileName,
						project: nextProject,
						schema: edit.schema,
						sequenceNodePath: edit.sequenceNodePath,
					}),
				})),
			};
		},
	};

	const packageInstallation: BrowserStudioPackageInstallationOperations = {
		installPackages: async ({dependencies}) => {
			try {
				if (dependencies.length === 0) {
					throw new Error('No packages were specified');
				}

				const installedDependencies =
					await resolveElementDependencies(dependencies);
				const project = getProject();
				const nextProject = addDependenciesToProject({
					dependencies: installedDependencies,
					project,
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: 'Install packages',
					mutate: () => nextProject,
					nodePathMutationFiles: null,
				});

				return {success: true};
			} catch (error) {
				return getStructuredError(error);
			}
		},
	};

	const deleteJsxNodes: BrowserStudioOperations['deleteJsxNodes'] = async ({
		nodes,
	}) => {
		try {
			if (nodes.length === 0) {
				throw new Error('No JSX nodes were specified for deletion');
			}

			const project = getProject();
			const result = await deleteJsxNodesCodemod({
				project,
				nodes: nodes.map((node) => ({
					filePath: node.fileName,
					nodePath: node.nodePath,
				})),
			});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: result.changes.map(({filePath}) => filePath).join(', '),
				mutate: () => result.project,
				nodePathMutationFiles: getNodePathMutationFiles(result),
			});
			if (nodePathMutation === null) {
				throw new Error('Could not delete JSX nodes');
			}

			return {success: true, nodePathMutation};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error && error.stack ? error.stack : '',
			};
		}
	};

	const duplicateJsxNode: BrowserStudioOperations['duplicateJsxNode'] = async ({
		nodes,
	}) => {
		try {
			if (nodes.length === 0) {
				throw new Error('No JSX nodes were specified for duplication');
			}

			const project = getProject();
			const result = await duplicateJsxNodesCodemod({
				project,
				nodes: nodes.map((node) => ({
					filePath: node.fileName,
					nodePath: node.nodePath,
				})),
			});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: result.changes.map(({filePath}) => filePath).join(', '),
				mutate: () => result.project,
				nodePathMutationFiles: getNodePathMutationFiles(result),
			});
			if (nodePathMutation === null) {
				throw new Error('Could not duplicate JSX node');
			}

			return {success: true, nodePathMutation};
		} catch (error) {
			return getStructuredError(error);
		}
	};

	const splitJsxSequence: BrowserStudioOperations['splitJsxSequence'] = async ({
		sequences,
	}) => {
		try {
			if (sequences.length === 0) {
				throw new Error('No JSX sequences were specified for splitting');
			}

			const project = getProject();
			const result = await splitSequences({
				project,
				splits: sequences.map((sequence) => ({
					node: {filePath: sequence.fileName, nodePath: sequence.nodePath},
					frame: sequence.splitFrame,
					sequenceKeys: sequence.sequenceKeys,
				})),
			});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: result.changes.map(({filePath}) => filePath).join(', '),
				mutate: () => result.project,
				nodePathMutationFiles: getNodePathMutationFiles(result),
			});
			if (nodePathMutation === null) {
				throw new Error('Could not split JSX sequence');
			}

			return {success: true, nodePathMutation};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error && error.stack ? error.stack : '',
			};
		}
	};

	const applyCodemod: BrowserStudioOperations['applyCodemod'] = async ({
		codemod,
		dryRun,
		symbolicatedStack,
		undoRedoNavigation,
	}) => {
		try {
			if (codemod.type === 'apply-visual-control') {
				throw new Error(
					'Applying visual controls is not supported in Browser Studio',
				);
			}

			const project = getProject();
			const absolutePath = resolveCodemodTargetFile({
				codemod,
				project,
				symbolicatedStack,
			});
			const input = project.files[absolutePath];
			const nextProject = applyCompositionCodemod({
				project,
				compositionFile: absolutePath,
				codemod,
			});
			const newContents = nextProject.files[absolutePath];
			const output =
				codemod.type === 'new-composition' ||
				codemod.type === 'duplicate-composition' ||
				codemod.type === 'rename-composition' ||
				codemod.type === 'delete-composition'
					? newContents
					: (await formatCodemodFile({contents: newContents})).output;
			const files: Record<string, string> = {
				...nextProject.files,
				[absolutePath]: output,
			};

			const diff = simpleDiff({
				oldLines: input.split('\n'),
				newLines: output.split('\n'),
			});

			if (!dryRun) {
				controller.applyMutation({
					undoRedoNavigation,
					timelineSelection: null,
					fileName: absolutePath,
					nodePathMutationFiles: null,
					mutate: () => ({...project, files}),
				});
			}

			return {success: true, diff};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
			};
		}
	};

	const reorderSequence: BrowserStudioOperations['reorderSequence'] = async ({
		fileName,
		sourceNodePath,
		targetNodePath,
		position,
	}) => {
		try {
			const project = getProject();
			const absolutePath = findProjectFile({
				filePath: fileName,
				project,
			});
			const result = await reorderJsxNode({
				project,
				node: {filePath: absolutePath, nodePath: sourceNodePath.nodePath},
				target: {filePath: absolutePath, nodePath: targetNodePath.nodePath},
				position,
			});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: absolutePath,
				mutate: () => result.project,
				nodePathMutationFiles: getNodePathMutationFiles(result),
			});
			if (nodePathMutation === null) {
				throw new Error('Could not reorder sequence');
			}

			return {success: true, nodePathMutation};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error && error.stack ? error.stack : '',
			};
		}
	};

	const keyframes: BrowserStudioKeyframeOperations = {
		addSequenceKeyframe: async (request) => {
			const result = await commitKeyframeMutations({
				label: `${request.key} keyframe`,
				sequenceMutations: [
					{
						fileName: request.fileName,
						nodePath: request.nodePath,
						schema: request.schema,
						updates: [
							{
								key: request.key,
								operation: {
									type: 'add',
									frame: request.frame,
									value: JSON.parse(request.value),
								},
							},
						],
					},
				],
				effectMutations: [],
			});
			const mutation = result.appliedSequenceMutations[0];
			if (!mutation) {
				throw new Error('Could not add sequence keyframe');
			}

			return getSequenceKeyframeResponse({mutation, project: result.project});
		},
		addEffectKeyframe: async (request) => {
			const result = await commitKeyframeMutations({
				label: `${request.key} effect keyframe`,
				sequenceMutations: [],
				effectMutations: [
					{
						fileName: request.fileName,
						sequenceNodePath: request.sequenceNodePath,
						effectIndex: request.effectIndex,
						schema: request.schema,
						updates: [
							{
								key: request.key,
								operation: {
									type: 'add',
									frame: request.frame,
									value: JSON.parse(request.value),
								},
							},
						],
					},
				],
			});
			const mutation = result.appliedEffectMutations[0];
			if (!mutation) {
				throw new Error('Could not add effect keyframe');
			}

			return getEffectKeyframeResponse({mutation, project: result.project});
		},
		addKeyframes: async ({sequenceKeyframes, effectKeyframes}) => {
			await commitKeyframeMutations({
				label: `${sequenceKeyframes.length + effectKeyframes.length} keyframes`,
				sequenceMutations: sequenceKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					nodePath: keyframe.nodePath,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'add',
								frame: keyframe.frame,
								value: JSON.parse(keyframe.value),
							},
						},
					],
				})),
				effectMutations: effectKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					sequenceNodePath: keyframe.sequenceNodePath,
					effectIndex: keyframe.effectIndex,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'add',
								frame: keyframe.frame,
								value: JSON.parse(keyframe.value),
							},
						},
					],
				})),
			});
			return {success: true};
		},
		deleteKeyframes: async ({sequenceKeyframes, effectKeyframes}) => {
			await commitKeyframeMutations({
				label: `${sequenceKeyframes.length + effectKeyframes.length} keyframes`,
				sequenceMutations: sequenceKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					nodePath: keyframe.nodePath,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'remove',
								frame: keyframe.frame,
								valueWhenLastKeyframeDeleted:
									keyframe.valueWhenLastKeyframeDeleted ?? null,
							},
						},
					],
				})),
				effectMutations: effectKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					sequenceNodePath: keyframe.sequenceNodePath,
					effectIndex: keyframe.effectIndex,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'remove',
								frame: keyframe.frame,
								valueWhenLastKeyframeDeleted:
									keyframe.valueWhenLastKeyframeDeleted ?? null,
							},
						},
					],
				})),
			});
			return {success: true};
		},
		moveKeyframes: async ({sequenceKeyframes, effectKeyframes}) => {
			await commitKeyframeMutations({
				label: `${sequenceKeyframes.length + effectKeyframes.length} keyframes`,
				sequenceMutations: sequenceKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					nodePath: keyframe.nodePath,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'move',
								moves: [
									{
										fromFrame: keyframe.fromFrame,
										toFrame: keyframe.toFrame,
									},
								],
							},
						},
					],
				})),
				effectMutations: effectKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					sequenceNodePath: keyframe.sequenceNodePath,
					effectIndex: keyframe.effectIndex,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'move',
								moves: [
									{
										fromFrame: keyframe.fromFrame,
										toFrame: keyframe.toFrame,
									},
								],
							},
						},
					],
				})),
			});
			return {success: true};
		},
		updateSequenceKeyframeSettings: async (request) => {
			const result = await commitKeyframeMutations({
				label: `${request.key} keyframe settings`,
				sequenceMutations: [
					{
						fileName: request.fileName,
						nodePath: request.nodePath,
						schema: request.schema,
						updates: [{key: request.key, operation: request.settings}],
					},
				],
				effectMutations: [],
			});
			const mutation = result.appliedSequenceMutations[0];
			if (!mutation) {
				throw new Error('Could not update sequence keyframe settings');
			}

			return getSequenceKeyframeResponse({mutation, project: result.project});
		},
		updateEffectKeyframeSettings: async (request) => {
			const result = await commitKeyframeMutations({
				label: `${request.key} effect keyframe settings`,
				sequenceMutations: [],
				effectMutations: [
					{
						fileName: request.fileName,
						sequenceNodePath: request.sequenceNodePath,
						effectIndex: request.effectIndex,
						schema: request.schema,
						updates: [{key: request.key, operation: request.settings}],
					},
				],
			});
			const mutation = result.appliedEffectMutations[0];
			if (!mutation) {
				throw new Error('Could not update effect keyframe settings');
			}

			return getEffectKeyframeResponse({mutation, project: result.project});
		},
		batchUpdateKeyframeSettings: async ({
			sequenceKeyframes,
			effectKeyframes,
		}) => {
			await commitKeyframeMutations({
				label: `${sequenceKeyframes.length + effectKeyframes.length} keyframe settings`,
				sequenceMutations: sequenceKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					nodePath: keyframe.nodePath,
					schema: keyframe.schema,
					updates: [{key: keyframe.key, operation: keyframe.settings}],
				})),
				effectMutations: effectKeyframes.map((keyframe) => ({
					fileName: keyframe.fileName,
					sequenceNodePath: keyframe.sequenceNodePath,
					effectIndex: keyframe.effectIndex,
					schema: keyframe.schema,
					updates: [{key: keyframe.key, operation: keyframe.settings}],
				})),
			});
			return {success: true};
		},
	};

	const duplicateComposition: BrowserStudioOperations['duplicateComposition'] =
		async ({codemod, dryRun, undoRedoNavigation}) => {
			try {
				const project = getProject();
				const compositionFile = getCompositionFile({
					compositionId: codemod.idToDuplicate,
					project,
				});
				if (compositionFile === null) {
					throw new Error(
						`Could not find composition "${codemod.idToDuplicate}" to duplicate`,
					);
				}

				const absolutePath = findProjectFile({
					filePath: compositionFile,
					project,
				});
				const input = project.files[absolutePath];
				const nextProject = applyCompositionCodemod({
					project,
					compositionFile: absolutePath,
					codemod,
				});
				const newContents = nextProject.files[absolutePath];
				const {output} = await formatCodemodFile({contents: newContents});
				const diff = simpleDiff({
					oldLines: input.split('\n'),
					newLines: output.split('\n'),
				});

				if (!dryRun) {
					controller.applyMutation({
						undoRedoNavigation,
						timelineSelection: null,
						fileName: absolutePath,
						nodePathMutationFiles: null,
						mutate: () => ({
							...project,
							files: {...project.files, [absolutePath]: output},
						}),
					});
				}

				return {success: true, diff};
			} catch (error) {
				return {
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error && error.stack ? error.stack : '',
				};
			}
		};

	const updateDefaultProps: BrowserStudioOperations['updateDefaultProps'] =
		async ({compositionId, defaultProps, enumPaths}) => {
			try {
				const project = getProject();
				const compositionFile = getCompositionFile({compositionId, project});
				if (compositionFile === null) {
					throw new Error(`Could not find composition "${compositionId}"`);
				}

				const absolutePath = findProjectFile({
					filePath: compositionFile,
					project,
				});
				const result = await setCompositionDefaultProps({
					project,
					compositionFile: absolutePath,
					compositionId,
					defaultProps: JSON.parse(defaultProps),
					enumPaths,
				});
				controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: absolutePath,
					nodePathMutationFiles: null,
					mutate: () => result.project,
				});

				return {success: true};
			} catch (error) {
				return {
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error && error.stack ? error.stack : '',
				};
			}
		};

	const splitVideoFromAudio: BrowserStudioOperations['splitVideoFromAudio'] =
		async ({fileName, nodePath}) => {
			try {
				const project = getProject();
				const absolutePath = findProjectFile({filePath: fileName, project});
				const result = await detachAudio({
					project,
					node: {filePath: absolutePath, nodePath},
				});
				const nodePathMutation = controller.applyMutation({
					undoRedoNavigation: null,
					timelineSelection: null,
					fileName: absolutePath,
					mutate: () => result.project,
					nodePathMutationFiles: getNodePathMutationFiles(result),
				});
				if (nodePathMutation === null) {
					throw new Error('Could not split video from audio');
				}

				return {success: true, nodePathMutation};
			} catch (error) {
				return {
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error && error.stack ? error.stack : '',
				};
			}
		};

	const insertBasicCaptions: BrowserStudioOperations['insertBasicCaptions'] = ({
		fileName,
		nodePath,
		captions,
		durationInFrames,
	}) => {
		try {
			const project = getProject();
			const absolutePath = findProjectFile({filePath: fileName, project});
			const elementFile = getBasicCaptionsElementFile({
				fileName: absolutePath,
				readFileContents: (candidate) => project.files[candidate] ?? null,
			});
			const result = insertBasicCaptionsCodemod({
				input: project.files[absolutePath],
				nodePath,
				captions,
				durationInFrames,
				importPath: elementFile.importPath,
			});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: absolutePath,
				mutate: () => ({
					...project,
					files: {
						...project.files,
						...(elementFile.shouldWrite
							? {[elementFile.fileName]: basicCaptionsElementSource}
							: {}),
						[absolutePath]: result.output,
					},
				}),
				nodePathMutationFiles: [
					{
						absolutePath,
						remappings: result.nodePathRemappings,
					},
				],
			});
			if (nodePathMutation === null) {
				throw new Error('Could not insert Basic captions');
			}

			return Promise.resolve({success: true as const, nodePathMutation});
		} catch (error) {
			return Promise.resolve({
				success: false as const,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error && error.stack ? error.stack : '',
			});
		}
	};

	const insertVideoLayers: BrowserStudioOperations['insertVideoLayers'] = ({
		fileName,
		nodePath,
		baseSrc,
		foregroundSrc,
	}) => {
		try {
			const project = getProject();
			const absolutePath = findProjectFile({filePath: fileName, project});
			const result = insertVideoLayersCodemod({
				input: project.files[absolutePath],
				nodePath,
				baseSrc,
				foregroundSrc,
			});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName: absolutePath,
				mutate: () => ({
					...project,
					files: {...project.files, [absolutePath]: result.output},
				}),
				nodePathMutationFiles: [
					{
						absolutePath,
						remappings: result.nodePathRemappings,
					},
				],
			});
			if (nodePathMutation === null) {
				throw new Error('Could not insert separated video layers');
			}

			return Promise.resolve({success: true as const, nodePathMutation});
		} catch (error) {
			return Promise.resolve({
				success: false as const,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error && error.stack ? error.stack : '',
			});
		}
	};

	const insertJsxElement: BrowserStudioOperations['insertJsxElement'] = async (
		request,
	) => {
		try {
			const requiredPackage = getRequiredPackageForInsertableElement(
				request.element,
			);
			const installedDependencies =
				requiredPackage === null
					? {}
					: await resolveElementDependencies([
							{name: requiredPackage, version: null},
						]);
			const project = addDependenciesToProject({
				dependencies: installedDependencies,
				project: getProject(),
			});
			const insertion =
				request.element.type === 'solid'
					? addSolid({
							project,
							compositionId: request.compositionId,
							compositionFile: request.compositionFile,
							width: request.element.width,
							height: request.element.height,
							position: request.element.position ?? undefined,
							from: request.from ?? undefined,
						})
					: null;
			const result = insertion
				? {
						project: insertion.project,
						filePath: insertion.insertedNode.filePath,
						insertedNodePath: insertion.insertedNode.nodePath,
						nodePathRemappings: insertion.nodePathRemappings.map(
							({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
						),
					}
				: await insertJsxElementIntoProjectWithNodePathRemappings({
						project,
						request,
						svgMarkupToJsx,
						wrapInSequence: null,
					});
			const nodePathMutation = controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection:
					result.insertedNodePath === null
						? null
						: {
								absolutePath: result.filePath,
								compositionId: request.compositionId,
								nodePath: result.insertedNodePath,
							},
				fileName: result.filePath,
				mutate: () => result.project,
				nodePathMutationFiles: [
					{
						absolutePath: result.filePath,
						remappings: result.nodePathRemappings,
					},
				],
			});
			if (nodePathMutation === null) {
				throw new Error('Could not insert JSX element');
			}

			return {
				success: true,
				insertedNodePath:
					result.insertedNodePath === null
						? null
						: {
								absolutePath: result.filePath,
								nodePath: result.insertedNodePath,
							},
				nodePathMutation,
			};
		} catch (error) {
			return {
				success: false,
				reason: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error && error.stack ? error.stack : '',
			};
		}
	};

	return {
		applyCodemod,
		consumeInitialElement: () => {
			const value = pendingInitialElement;
			pendingInitialElement = null;
			return value === null
				? null
				: {
						element: {
							...value.payload.element,
							durationInFrames: value.payload.element.durationInFrames ?? null,
							installationMode: value.payload.element.installationMode ?? null,
						},
						sourceOrigin: value.sourceOrigin,
					};
		},
		deleteJsxNodes,
		deleteStaticFile: controller.deleteStaticFile,
		downloadRemoteAsset: (request) =>
			downloadRemoteAssetInBrowserStudio({
				getProject,
				request,
				writeStaticFile: controller.writeStaticFile,
			}),
		downloadProject: () =>
			makeBrowserStudioProjectArchive({
				dependencyVersions,
				project: getProject(),
			}),
		duplicateComposition,
		duplicateJsxNode,
		effects: effectOperations,
		emitEvent: controller.emitEvent,
		findInFile: controller.findInFile,
		getFileSource: controller.getFileSource,
		getCompositionFile: (compositionId) =>
			getCompositionFile({compositionId, project: getProject()}),
		getCompositionComponentInfo: (request) =>
			Promise.resolve(
				getCompositionComponentInfo({project: getProject(), request}),
			),
		insertElement: async (request) => {
			try {
				StudioProtocolInternals.assertElementAssets(request.element.assets);
				const element = {
					...request.element,
					sourceCode: lowerElementStaticFileRefs({
						assets: request.element.assets,
						sourceCode: request.element.sourceCode,
					}),
				};
				const installationMode = request.element.installationMode ?? 'wrapped';
				const componentOwnsSequence =
					installationMode === 'component-owned-sequence';
				if (
					componentOwnsSequence &&
					request.element.initialProps !== null &&
					['from', 'durationInFrames', 'name'].some((prop) =>
						Object.hasOwn(request.element.initialProps ?? {}, prop),
					)
				) {
					throw new Error(
						'Component-owned Element initial props must not override from, durationInFrames, or name',
					);
				}

				if (
					componentOwnsSequence &&
					request.element.initialProps?.style !== undefined &&
					(request.element.initialProps.style === null ||
						typeof request.element.initialProps.style !== 'object' ||
						Array.isArray(request.element.initialProps.style))
				) {
					throw new Error(
						'Component-owned Element initial style must be an object',
					);
				}

				const originalProject = getProject();
				let project = originalProject;
				if (request.newComposition !== null) {
					if (request.newComposition.codemod.newId !== request.compositionId) {
						throw new Error(
							'New composition ID does not match installation target',
						);
					}

					const absolutePath = resolveCodemodTargetFile({
						codemod: request.newComposition.codemod,
						project,
						symbolicatedStack: request.newComposition.symbolicatedStack,
					});
					if (absolutePath !== request.compositionFile) {
						throw new Error(
							'New composition source does not match installation target',
						);
					}

					project = applyCompositionCodemod({
						project,
						compositionFile: absolutePath,
						codemod: request.newComposition.codemod,
					});
				}

				const plan = await getElementInstallPlanForProject({
					installationName: request.installationName,
					destination: {
						type: 'current-composition',
						compositionFile: request.compositionFile,
						compositionId: request.compositionId,
					},
					element,
					project,
				});
				if (
					request.expectedFileState !== null &&
					!expectedFileStateMatches({
						actual: plan.expectedFileState,
						expected: request.expectedFileState,
					})
				) {
					if (plan.existingSource !== null) {
						return {
							success: false,
							type: 'file-conflict',
							conflict: {
								existingSource: plan.existingSource,
								filePath: plan.filePath,
								incomingSource: element.sourceCode,
							},
						};
					}

					throw new Error('Element source changed during installation');
				}

				if (!request.overwriteExisting && plan.existingSource !== null) {
					return {
						success: false,
						type: 'file-conflict',
						conflict: {
							existingSource: plan.existingSource,
							filePath: plan.filePath,
							incomingSource: element.sourceCode,
						},
					};
				}

				const resolvedAssets =
					await StudioProtocolInternals.resolveElementAssets({
						assets: request.element.assets,
						downloadAsset: (options) =>
							fetchRemoteAssetBytesInBrowserStudio({
								...options,
								acceptHeader: null,
							}),
					});
				const publicFiles = getCanonicalPublicFiles(originalProject);
				const newAssetFiles: Record<string, VirtualProjectPublicFile> =
					Object.create(null);
				for (const {path: assetPath, contents} of resolvedAssets) {
					const destination = assetPath.toLowerCase();
					const conflict = Object.keys(publicFiles).find((filePath) => {
						const existingPath = filePath.toLowerCase();
						return (
							(filePath !== assetPath && existingPath === destination) ||
							existingPath.startsWith(`${destination}/`) ||
							destination.startsWith(`${existingPath}/`)
						);
					});
					if (conflict !== undefined) {
						throw new Error(
							`Asset ${assetPath} conflicts with existing public file ${conflict}`,
						);
					}

					const existing = publicFiles[assetPath];
					if (existing === undefined) {
						newAssetFiles[assetPath] = contents;
						continue;
					}

					const storage = originalProject.publicFileStorage;
					if (
						typeof existing !== 'string' &&
						!(existing instanceof Uint8Array) &&
						storage === undefined
					) {
						throw new Error(
							`Stored public file ${assetPath} has no project storage`,
						);
					}

					const existingBlob =
						typeof existing === 'string' || existing instanceof Uint8Array
							? new Blob([
									typeof existing === 'string'
										? existing
										: existing.slice().buffer,
								])
							: await getBrowserStudioStoredPublicFile({
									file: existing,
									storage: storage!,
								});
					if (
						existingBlob.size !== contents.byteLength ||
						!new Uint8Array(await existingBlob.arrayBuffer()).every(
							(byte, index) => byte === contents[index],
						)
					) {
						throw new Error(
							`Asset ${assetPath} already exists with different contents`,
						);
					}
				}

				const installedDependencies = await resolveElementDependencies(
					request.element.dependencies,
				);
				const durationInFrames = request.element.durationInFrames ?? null;
				const insertion =
					await insertJsxElementIntoProjectWithNodePathRemappings({
						project,
						request: {
							compositionFile: request.compositionFile,
							compositionId: request.compositionId,
							element: {
								componentName: plan.componentName,
								importName: plan.componentName,
								importPath: plan.importPath,
								position: componentOwnsSequence ? request.position : null,
								props: [
									...Object.entries(request.element.initialProps ?? {}).map(
										([name, value]) => ({name, value}),
									),
									...(componentOwnsSequence && durationInFrames !== null
										? [
												{
													name: 'durationInFrames',
													value: durationInFrames,
												},
											]
										: []),
									...(componentOwnsSequence
										? [{name: 'name', value: request.element.displayName}]
										: []),
								],
								type: 'component',
							},
							from: componentOwnsSequence ? request.from : null,
						},
						svgMarkupToJsx,
						wrapInSequence: componentOwnsSequence
							? null
							: {
									dimensions: request.element.dimensions,
									durationInFrames,
									from: request.from,
									name: request.element.displayName,
									position: request.position,
								},
					});
				const projectWithElement = {
					...insertion.project,
					files: {
						...insertion.project.files,
						[plan.elementFilePath]: element.sourceCode,
					},
				};
				const nextProject = addDependenciesToProject({
					dependencies: installedDependencies,
					project: {
						...projectWithElement,
						publicFiles: {
							...(projectWithElement.publicFiles ?? {}),
							...newAssetFiles,
						},
					},
				});
				if (getProject() !== originalProject) {
					throw new Error(
						'Project changed during Element installation. Please try again.',
					);
				}

				const nodePathMutation = controller.applyMutation({
					undoRedoNavigation: request.undoRedoNavigation,
					timelineSelection: null,
					fileName: insertion.filePath,
					mutate: () => nextProject,
					nodePathMutationFiles: [
						{
							absolutePath: insertion.filePath,
							remappings: insertion.nodePathRemappings,
						},
					],
				});
				if (nodePathMutation === null) {
					throw new Error('Could not insert Element');
				}

				return {success: true, nodePathMutation};
			} catch (error) {
				return {
					success: false,
					type: 'error',
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? (error.stack ?? '') : '',
				} satisfies InsertElementResponse;
			}
		},
		insertJsxElement,
		insertSolid: insertJsxElement,
		keyframes,
		packageInstallation,
		prepareElementInstall: async (request) => {
			try {
				StudioProtocolInternals.assertElementAssets(request.element.assets);
				const sourceCode = lowerElementStaticFileRefs({
					assets: request.element.assets,
					sourceCode: request.element.sourceCode,
				});
				const plan = await getElementInstallPlanForProject({
					...request,
					element: {...request.element, sourceCode},
					project: getProject(),
				});
				return {
					success: true,
					plan: {
						compositionFile: plan.destinationCompositionFilePath,
						expectedFileState: plan.expectedFileState,
						filePath: plan.filePath,
					},
				};
			} catch (error) {
				return {
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? (error.stack ?? '') : '',
				};
			}
		},
		redo: controller.redo,
		renameStaticFile: controller.renameStaticFile,
		reorderSequence,
		saveSequenceProps: async (request) => {
			const project = getProject();
			const hasPropChanges =
				request.edits.length > 0 || (request.captionPatches?.length ?? 0) > 0;
			const propResult = hasPropChanges
				? saveSequencePropsInProject({project, request})
				: null;
			const sequenceMutations: SequenceKeyframeMutation[] = [
				...(request.addedKeyframes ?? []).map((keyframe) => ({
					fileName: keyframe.fileName,
					nodePath: keyframe.nodePath,
					schema: keyframe.schema,
					updates: [
						{
							key: keyframe.key,
							operation: {
								type: 'add' as const,
								frame: keyframe.frame,
								value: JSON.parse(keyframe.value),
							},
						},
					],
				})),
				...(request.movedKeyframes?.sequenceKeyframes ?? []).map(
					(keyframe) => ({
						fileName: keyframe.fileName,
						nodePath: keyframe.nodePath,
						schema: keyframe.schema,
						updates: [
							{
								key: keyframe.key,
								operation: {
									type: 'move' as const,
									moves: [
										{
											fromFrame: keyframe.fromFrame,
											toFrame: keyframe.toFrame,
										},
									],
								},
							},
						],
					}),
				),
			];
			const effectMutations: EffectKeyframeMutation[] = (
				request.movedKeyframes?.effectKeyframes ?? []
			).map((keyframe) => ({
				fileName: keyframe.fileName,
				sequenceNodePath: keyframe.sequenceNodePath,
				effectIndex: keyframe.effectIndex,
				schema: keyframe.schema,
				updates: [
					{
						key: keyframe.key,
						operation: {
							type: 'move',
							moves: [
								{
									fromFrame: keyframe.fromFrame,
									toFrame: keyframe.toFrame,
								},
							],
						},
					},
				],
			}));
			const keyframeResult =
				sequenceMutations.length > 0 || effectMutations.length > 0
					? await mutateKeyframesInProject({
							project: propResult?.project ?? project,
							sequenceMutations,
							effectMutations,
						})
					: null;
			if (propResult === null && keyframeResult === null) {
				throw new Error('No sequence prop edits to save');
			}

			const firstTarget = request.edits[0] ?? request.captionPatches?.[0];
			controller.applyMutation({
				undoRedoNavigation: null,
				timelineSelection: null,
				fileName:
					firstTarget?.fileName ??
					sequenceMutations[0]?.fileName ??
					'Keyframes',
				nodePathMutationFiles: null,
				mutate: () => keyframeResult?.project ?? propResult!.project,
			});
			if (propResult) {
				return propResult.response;
			}

			const firstSequenceMutation = keyframeResult?.appliedSequenceMutations[0];
			return firstSequenceMutation && keyframeResult
				? getSequenceKeyframeResponse({
						mutation: firstSequenceMutation,
						project: keyframeResult.project,
					})
				: {canUpdate: true, props: {}, results: []};
		},
		resetHistory: () => {
			controller.resetHistory();
			refreshDefaultPropsSubscriptions();
			refreshSequencePropsSubscriptions();
		},
		splitVideoFromAudio,
		insertBasicCaptions,
		insertVideoLayers,
		subscribeToDefaultProps: ({clientId, compositionId}) => {
			const clients =
				defaultPropsSubscriptions.get(compositionId) ?? new Set<string>();
			clients.add(clientId);
			defaultPropsSubscriptions.set(compositionId, clients);
			const result = getDefaultPropsStatus(compositionId);
			lastDefaultPropsResults.set(compositionId, JSON.stringify(result));
			return Promise.resolve(result);
		},
		splitJsxSequence,
		subscribeToEvent: controller.subscribeToEvent,
		subscribeToSequenceProps: (request) => {
			const result = getSequencePropsSubscription(request);
			if (!result.success) {
				return Promise.resolve(result);
			}

			const key = makeSequencePropsSubscriptionKey({
				clientId: request.clientId,
				fileName: request.fileName,
				nodePath: result.nodePath,
				sequenceKeys: request.keys,
				assetKeys: request.assetKeys,
				effectKeys: request.effects,
			});
			const existing = sequencePropsSubscriptions.get(key);
			if (existing) {
				existing.refCount++;
				return Promise.resolve(result);
			}

			sequencePropsSubscriptions.set(key, {
				request,
				result,
				refCount: 1,
				effectChain: getEffectChain(result),
			});
			return Promise.resolve(result);
		},
		undo: controller.undo,
		unsubscribeFromDefaultProps: ({clientId, compositionId}) => {
			const clients = defaultPropsSubscriptions.get(compositionId);
			clients?.delete(clientId);
			if (clients?.size === 0) {
				defaultPropsSubscriptions.delete(compositionId);
				lastDefaultPropsResults.delete(compositionId);
			}

			return Promise.resolve(undefined);
		},
		unsubscribeFromSequenceProps: (request) => {
			const key = makeSequencePropsSubscriptionKey(request);
			const subscription = sequencePropsSubscriptions.get(key);
			if (!subscription) {
				return Promise.resolve(undefined);
			}

			subscription.refCount--;
			if (subscription.refCount <= 0) {
				sequencePropsSubscriptions.delete(key);
			}

			return Promise.resolve(undefined);
		},
		updateDefaultProps,
		writeStaticFile: controller.writeStaticFile,
	};
};
