import {
	addEffect as addEffectCodemod,
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
	deleteJsxNodes,
	deleteEffects as deleteEffectsCodemod,
	duplicateEffects as duplicateEffectsCodemod,
	duplicateCompositionInSource,
	duplicateJsxNode as duplicateJsxNodeCodemod,
	findProjectFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	formatInlineContentWithFormatter,
	getFolderFile,
	getRootFileForProject,
	insertJsxElementIntoProjectWithNodePathRemappings,
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	makeInMemoryInsertJsxElementCodemodEnvironment,
	parseAndApplyCodemod,
	pasteEffects as pasteEffectsCodemod,
	reorderEffect as reorderEffectCodemod,
	reorderSequence as reorderSequenceCodemod,
	resolveCompositionComponentWithFile,
	simpleDiff,
	splitJsxSequence as splitJsxSequenceCodemod,
	splitVideoFromAudio as splitVideoFromAudioCodemod,
	updateDefaultProps as updateDefaultPropsCodemod,
	updateEffectProps as updateEffectPropsCodemod,
	updateEffectKeyframes,
	updateSequenceKeyframes,
	type EffectKeyframeUpdate,
	type FormatInline,
	type SequenceKeyframeUpdate,
} from '@remotion/studio-codemods';
import {
	StudioProtocolInternals,
	type StudioElementPayload,
} from '@remotion/studio-protocol';
import {
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
import {createBrowserStudioProjectController} from './browser-studio-project-controller';
import {makeBrowserStudioProjectArchive} from './download-project';
import {downloadRemoteAssetInBrowserStudio} from './download-remote-asset';
import {saveSequencePropsInProject} from './save-sequence-props';
import type {VirtualProject} from './types';

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

const formatInline: FormatInline = ({inlineContent, linePrefix, endOfLine}) =>
	formatInlineContentWithFormatter({
		inlineContent,
		linePrefix,
		endOfLine,
		prettierConfig: {
			bracketSpacing: false,
			parser: 'typescript',
			singleQuote: true,
			tabWidth: 2,
			useTabs: false,
		},
		format: (source, options) =>
			format(source, {
				...options,
				plugins: [prettierPluginTypescript, prettierPluginEstree],
			}),
	});

const getStructuredError = (error: unknown) => ({
	success: false as const,
	reason: error instanceof Error ? error.message : String(error),
	stack: error instanceof Error && error.stack ? error.stack : '',
});

export {
	insertSolidIntoProject,
	insertSolidIntoProjectWithNodePathRemappings,
} from '@remotion/studio-codemods';

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

const normalizeElementSource = (source: string) =>
	source.replace(/\r\n/g, '\n').trim();

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

	const rootFile = getRootFileForProject({
		entryPoint: project.entryPoint,
		project,
	});
	if (rootFile === null) {
		throw new Error('Could not find the root file of the project');
	}

	return findProjectFile({filePath: rootFile, project});
};

const makeNewCompositionComponentSource = (componentName: string) =>
	`import React from 'react';

export const ${componentName}: React.FC = () => {
	return null;
};
`;

const getElementInstallPlanForProject = async ({
	destination,
	element,
	project,
}: Parameters<BrowserStudioOperations['prepareElementInstall']>[0] & {
	project: VirtualProject;
}) => {
	const componentName =
		StudioProtocolInternals.getElementComponentNameFromSourceCode(
			element.sourceCode,
		);
	const elementFileName = StudioProtocolInternals.makeElementFileNameFromSlug(
		element.slug,
	);
	if (componentName === null || elementFileName === null) {
		throw new Error('Invalid Element source');
	}

	const target =
		destination.type === 'current-composition'
			? await resolveCompositionComponentWithFile({
					compositionFile: destination.compositionFile,
					compositionId: destination.compositionId,
					environment: makeInMemoryInsertJsxElementCodemodEnvironment({
						formatFile: formatCodemodFile,
						project,
						svgMarkupToJsx,
					}),
				})
			: null;
	if (target !== null && !target.canAddSequence) {
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
		target?.fileName ?? destinationCompositionFilePath;
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

		const files = {...project.files};
		const appliedSequenceMutations: AppliedSequenceKeyframeMutation[] = [];
		const appliedEffectMutations: AppliedEffectKeyframeMutation[] = [];

		for (const mutation of mergedSequenceMutations) {
			const absolutePath = findProjectFile({
				filePath: mutation.fileName,
				project,
			});
			const result = await updateSequenceKeyframes({
				input: files[absolutePath],
				nodePath: mutation.nodePath.nodePath,
				updates: mutation.updates,
				schema: mutation.schema,
				videoConfigValues: mutation.nodePath.videoConfigValues,
				formatFile: formatCodemodFile,
			});
			files[absolutePath] = result.output;
			appliedSequenceMutations.push({
				...mutation,
				absolutePath,
				updatedNodePath: result.updatedNodePath,
			});
		}

		for (const mutation of mergedEffectMutations) {
			const absolutePath = findProjectFile({
				filePath: mutation.fileName,
				project,
			});
			const result = await updateEffectKeyframes({
				input: files[absolutePath],
				sequenceNodePath: mutation.sequenceNodePath.nodePath,
				effectIndex: mutation.effectIndex,
				updates: mutation.updates,
				schema: mutation.schema,
				videoConfigValues: mutation.sequenceNodePath.videoConfigValues,
				formatFile: formatCodemodFile,
			});
			files[absolutePath] = result.output;
			appliedEffectMutations.push({
				...mutation,
				absolutePath,
				updatedSequenceNodePath: result.updatedSequenceNodePath,
			});
		}

		return {
			project: {...project, files},
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
		const status = computeSequencePropsStatusFromContent({
			fileContents: project.files[mutation.absolutePath],
			nodePath: mutation.updatedNodePath,
			componentIdentity: null,
			keys: getAllSchemaKeys(mutation.schema),
			effects: [],
			videoConfigValues: mutation.nodePath.videoConfigValues,
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
		const status = computeSequencePropsStatusFromContent({
			fileContents: project.files[mutation.absolutePath],
			nodePath: mutation.updatedSequenceNodePath,
			componentIdentity: null,
			keys: [],
			effects,
			videoConfigValues: mutation.sequenceNodePath.videoConfigValues,
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
				const nextStatus = computeSequencePropsStatusFromContent({
					fileContents: project.files[absolutePath],
					nodePath: result.nodePath.nodePath,
					componentIdentity: request.componentIdentity,
					keys: request.keys,
					assetKeys: request.assetKeys,
					effects: request.effects,
					videoConfigValues: request.videoConfigValues,
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
		const status = computeSequencePropsStatusFromContent({
			fileContents: project.files[absolutePath],
			nodePath: sequenceNodePath.nodePath,
			componentIdentity: null,
			keys: [],
			effects: Array.from({length: effectIndex + 1}, (_, index) =>
				index === effectIndex ? getAllSchemaKeys(schema) : [],
			),
			videoConfigValues: sequenceNodePath.videoConfigValues,
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
					effectConfig: request.effectConfig,
					effectImportPath: request.effectImportPath,
					effectName: request.effectName,
					formatFile: formatCodemodFile,
					input: project.files[absolutePath],
					sequenceNodePath: request.sequenceNodePath.nodePath,
				});
				controller.applyMutation({
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
		deleteEffects: async (request) => {
			try {
				if (request.length === 0) {
					throw new Error('No effects were specified for deletion');
				}

				const project = getProject();
				const groups = new Map<
					string,
					Array<
						| {
								type: 'single-effect';
								effectIndex: number;
								sequenceNodePath: SequenceNodePath;
						  }
						| {type: 'all-effects'; sequenceNodePath: SequenceNodePath}
					>
				>();
				for (const item of request) {
					const absolutePath = findProjectFile({
						filePath: item.fileName,
						project,
					});
					const group = groups.get(absolutePath) ?? [];
					group.push(
						item.type === 'single-effect'
							? {
									type: 'single-effect',
									effectIndex: item.effectIndex,
									sequenceNodePath: item.sequenceNodePath.nodePath,
								}
							: {
									type: 'all-effects',
									sequenceNodePath: item.sequenceNodePath.nodePath,
								},
					);
					groups.set(absolutePath, group);
				}

				const updates = await Promise.all(
					[...groups].map(async ([absolutePath, targets]) => ({
						absolutePath,
						result: await deleteEffectsCodemod({
							effects: targets,
							formatFile: formatCodemodFile,
							input: project.files[absolutePath],
						}),
					})),
				);
				controller.applyMutation({
					fileName: updates.map((update) => update.absolutePath).join(', '),
					nodePathMutationFiles: null,
					mutate: () => ({
						...project,
						files: {
							...project.files,
							...Object.fromEntries(
								updates.map((update) => [
									update.absolutePath,
									update.result.output,
								]),
							),
						},
					}),
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
				const groups = new Map<
					string,
					Array<{
						effectIndex: number;
						sequenceNodePath: SequenceNodePath;
					}>
				>();
				for (const item of request) {
					const absolutePath = findProjectFile({
						filePath: item.fileName,
						project,
					});
					const group = groups.get(absolutePath) ?? [];
					group.push({
						effectIndex: item.effectIndex,
						sequenceNodePath: item.sequenceNodePath.nodePath,
					});
					groups.set(absolutePath, group);
				}

				const updates = await Promise.all(
					[...groups].map(async ([absolutePath, targets]) => ({
						absolutePath,
						result: await duplicateEffectsCodemod({
							effects: targets,
							formatFile: formatCodemodFile,
							input: project.files[absolutePath],
						}),
					})),
				);
				controller.applyMutation({
					fileName: updates.map((update) => update.absolutePath).join(', '),
					nodePathMutationFiles: null,
					mutate: () => ({
						...project,
						files: {
							...project.files,
							...Object.fromEntries(
								updates.map((update) => [
									update.absolutePath,
									update.result.output,
								]),
							),
						},
					}),
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
					formatFile: formatCodemodFile,
					input: project.files[absolutePath],
					insertAtIndices: request.insertAtIndices,
					targetSequenceNodePath: request.targetSequenceNodePath.nodePath,
					type: request.type,
				});
				controller.applyMutation({
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
					formatFile: formatCodemodFile,
					fromIndex: request.fromIndex,
					input: project.files[absolutePath],
					sequenceNodePath: request.sequenceNodePath.nodePath,
					toIndex: request.toIndex,
				});
				controller.applyMutation({
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
		saveEffectProps: async (request) => {
			const project = getProject();
			const absolutePath = findProjectFile({
				filePath: request.fileName,
				project,
			});
			const result = await updateEffectPropsCodemod({
				effectIndex: request.effectIndex,
				formatFile: formatCodemodFile,
				input: project.files[absolutePath],
				schema: request.schema,
				sequenceNodePath: request.sequenceNodePath.nodePath,
				update:
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
			});
			const nextProject = {
				...project,
				files: {...project.files, [absolutePath]: result.output},
			};
			controller.applyMutation({
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
			const outputByPath = new Map<string, string>();
			for (const edit of request.edits) {
				const absolutePath = findProjectFile({
					filePath: edit.fileName,
					project,
				});
				const result = await updateEffectPropsCodemod({
					effectIndex: edit.effectIndex,
					formatFile: formatCodemodFile,
					input: outputByPath.get(absolutePath) ?? project.files[absolutePath],
					schema: edit.schema,
					sequenceNodePath: edit.sequenceNodePath.nodePath,
					update:
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
				});
				outputByPath.set(absolutePath, result.output);
			}

			const nextProject = {
				...project,
				files: {...project.files, ...Object.fromEntries(outputByPath)},
			};
			controller.applyMutation({
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

	const deleteJsxNode: BrowserStudioOperations['deleteJsxNode'] = async ({
		nodes,
	}) => {
		try {
			if (nodes.length === 0) {
				throw new Error('No JSX nodes were specified for deletion');
			}

			const project = getProject();
			const nodesByFile = new Map<
				string,
				(typeof nodes)[number]['nodePath'][]
			>();
			for (const node of nodes) {
				const fileName = findProjectFile({
					filePath: node.fileName,
					project,
				});
				const fileNodes = nodesByFile.get(fileName) ?? [];
				fileNodes.push(node.nodePath);
				nodesByFile.set(fileName, fileNodes);
			}

			const updates = await Promise.all(
				[...nodesByFile].map(async ([fileName, nodePaths]) => ({
					fileName,
					result: await deleteJsxNodes({
						input: project.files[fileName],
						nodePaths,
					}),
				})),
			);
			const nextProject = {
				...project,
				files: {
					...project.files,
					...Object.fromEntries(
						updates.map(({fileName, result}) => [fileName, result.output]),
					),
				},
			};
			const nodePathMutation = controller.applyMutation({
				fileName: updates.map(({fileName}) => fileName).join(', '),
				mutate: () => nextProject,
				nodePathMutationFiles: updates.map(({fileName, result}) => ({
					absolutePath: fileName,
					remappings: result.nodePathRemappings,
					restoredNodePaths: [],
				})),
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
		fileName,
		nodePath,
	}) => {
		try {
			const project = getProject();
			const absolutePath = findProjectFile({
				filePath: fileName,
				project,
			});
			const result = await duplicateJsxNodeCodemod({
				input: project.files[absolutePath],
				nodePath,
				formatFile: formatCodemodFile,
			});
			const nodePathMutation = controller.applyMutation({
				fileName: absolutePath,
				mutate: () => ({
					...project,
					files: {...project.files, [absolutePath]: result.output},
				}),
				nodePathMutationFiles: [
					{
						absolutePath,
						remappings: result.nodePathRemappings,
						restoredNodePaths: [],
					},
				],
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
		fileName,
		nodePath,
		sequenceKeys,
		splitFrame,
	}) => {
		try {
			const project = getProject();
			const absolutePath = findProjectFile({
				filePath: fileName,
				project,
			});
			const result = await splitJsxSequenceCodemod({
				input: project.files[absolutePath],
				nodePath,
				sequenceKeys,
				splitFrame,
				formatFile: formatCodemodFile,
			});
			const nodePathMutation = controller.applyMutation({
				fileName: absolutePath,
				mutate: () => ({
					...project,
					files: {...project.files, [absolutePath]: result.output},
				}),
				nodePathMutationFiles: [
					{
						absolutePath,
						remappings: result.nodePathRemappings,
						restoredNodePaths: [],
					},
				],
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
	}) => {
		try {
			if (codemod.type === 'apply-visual-control') {
				throw new Error(
					'Applying visual controls is not supported in Browser Studio',
				);
			}

			if (
				codemod.type === 'new-composition' &&
				codemod.canvasCapture !== null
			) {
				throw new Error(
					'Creating canvas capture compositions is not supported in Browser Studio',
				);
			}

			const project = getProject();
			const absolutePath = resolveCodemodTargetFile({
				codemod,
				project,
				symbolicatedStack,
			});
			const input = project.files[absolutePath];
			const {newContents} = parseAndApplyCodemod({input, codeMod: codemod});
			const {output} = await formatCodemodFile({contents: newContents});
			const files: Record<string, string> = {
				...project.files,
				[absolutePath]: output,
			};

			if (codemod.type === 'new-composition') {
				const componentFilePath = `${dirname(absolutePath)}/${codemod.componentName}.tsx`;
				if (project.files[componentFilePath] !== undefined) {
					throw new Error(
						`Cannot create ${relativeToRoot(componentFilePath, project.rootDir)} because it already exists`,
					);
				}

				const componentFile = await formatCodemodFile({
					contents: makeNewCompositionComponentSource(codemod.componentName),
				});
				files[componentFilePath] = componentFile.output;
			}

			const diff = simpleDiff({
				oldLines: input.split('\n'),
				newLines: output.split('\n'),
			});

			if (!dryRun) {
				controller.applyMutation({
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
			const result = await reorderSequenceCodemod({
				input: project.files[absolutePath],
				sourceNodePath: sourceNodePath.nodePath,
				targetNodePath: targetNodePath.nodePath,
				position,
				formatFile: formatCodemodFile,
			});
			const nodePathMutation = controller.applyMutation({
				fileName: absolutePath,
				mutate: () => ({
					...project,
					files: {...project.files, [absolutePath]: result.output},
				}),
				nodePathMutationFiles: [
					{
						absolutePath,
						remappings: result.nodePathRemappings,
						restoredNodePaths: [],
					},
				],
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
		async ({codemod, dryRun}) => {
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
				const {newContents} = duplicateCompositionInSource({
					input,
					codemod,
				});
				const {output} = await formatCodemodFile({contents: newContents});
				const diff = simpleDiff({
					oldLines: input.split('\n'),
					newLines: output.split('\n'),
				});

				if (!dryRun) {
					controller.applyMutation({
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
				const {output} = await updateDefaultPropsCodemod({
					input: project.files[absolutePath],
					compositionId,
					newDefaultProps: JSON.parse(defaultProps),
					enumPaths,
					formatInline,
				});
				controller.applyMutation({
					fileName: absolutePath,
					nodePathMutationFiles: null,
					mutate: () => ({
						...project,
						files: {...project.files, [absolutePath]: output},
					}),
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
				const result = await splitVideoFromAudioCodemod({
					input: project.files[absolutePath],
					nodePath,
					formatFile: formatCodemodFile,
				});
				const nodePathMutation = controller.applyMutation({
					fileName: absolutePath,
					mutate: () => ({
						...project,
						files: {...project.files, [absolutePath]: result.output},
					}),
					nodePathMutationFiles: [
						{
							absolutePath,
							remappings: result.nodePathRemappings,
							restoredNodePaths: [],
						},
					],
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
			const result = await insertJsxElementIntoProjectWithNodePathRemappings({
				formatFile: formatCodemodFile,
				project,
				request,
				svgMarkupToJsx,
				wrapInSequence: null,
			});
			const nodePathMutation = controller.applyMutation({
				fileName: result.filePath,
				mutate: () => result.project,
				nodePathMutationFiles: [
					{
						absolutePath: result.filePath,
						remappings: result.nodePathRemappings,
						restoredNodePaths: [],
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
						element: value.payload.element,
						sourceOrigin: value.sourceOrigin,
					};
		},
		deleteJsxNode,
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
				const project = getProject();
				const plan = await getElementInstallPlanForProject({
					destination: {
						type: 'current-composition',
						compositionFile: request.compositionFile,
						compositionId: request.compositionId,
					},
					element: request.element,
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
								incomingSource: request.element.sourceCode,
							},
						};
					}

					throw new Error('Element source changed during installation');
				}

				const sourcesDiffer =
					plan.existingSource !== null &&
					normalizeElementSource(plan.existingSource) !==
						normalizeElementSource(request.element.sourceCode);
				if (
					sourcesDiffer &&
					!request.overwriteExisting &&
					plan.existingSource !== null
				) {
					return {
						success: false,
						type: 'file-conflict',
						conflict: {
							existingSource: plan.existingSource,
							filePath: plan.filePath,
							incomingSource: request.element.sourceCode,
						},
					};
				}

				const installedDependencies = await resolveElementDependencies(
					request.element.dependencies,
				);
				const installationMode = request.element.installationMode ?? 'wrapped';
				const componentOwnsSequence =
					installationMode === 'component-owned-sequence';
				const durationInFrames = request.element.durationInFrames ?? null;
				const insertion =
					await insertJsxElementIntoProjectWithNodePathRemappings({
						formatFile: formatCodemodFile,
						project,
						request: {
							compositionFile: request.compositionFile,
							compositionId: request.compositionId,
							element: {
								componentName: plan.componentName,
								importName: plan.componentName,
								importPath: plan.importPath,
								position: componentOwnsSequence ? request.position : null,
								props: componentOwnsSequence
									? [
											...(durationInFrames === null
												? []
												: [
														{
															name: 'durationInFrames',
															value: durationInFrames,
														},
													]),
											{name: 'name', value: request.element.displayName},
										]
									: [],
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
						[plan.elementFilePath]: request.element.sourceCode,
					},
				};
				const nextProject = addDependenciesToProject({
					dependencies: installedDependencies,
					project: projectWithElement,
				});
				const nodePathMutation = controller.applyMutation({
					fileName: insertion.filePath,
					mutate: () => nextProject,
					nodePathMutationFiles: [
						{
							absolutePath: insertion.filePath,
							remappings: insertion.nodePathRemappings,
							restoredNodePaths: [],
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
				const plan = await getElementInstallPlanForProject({
					...request,
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
