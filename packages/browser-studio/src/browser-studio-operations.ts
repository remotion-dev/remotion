import {
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
	deleteJsxNodes,
	duplicateCompositionInSource,
	findProjectFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	insertJsxElementIntoProjectWithNodePathRemappings,
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	makeInMemoryInsertJsxElementCodemodEnvironment,
	resolveCompositionComponentWithFile,
	simpleDiff,
	splitJsxSequence as splitJsxSequenceCodemod,
	splitVideoFromAudio as splitVideoFromAudioCodemod,
} from '@remotion/studio-codemods';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	getRequiredPackageForInsertableElement,
	type BrowserStudioOperations,
	type ElementInstallExpectedFileState,
	type EventSourceEvent,
	type InsertElementResponse,
	type SubscribeToSequencePropsRequest,
	type SubscribeToSequencePropsResponse,
	type UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';
import {format} from 'prettier/standalone';
import {createBrowserStudioProjectController} from './browser-studio-project-controller';
import {makeBrowserStudioProjectArchive} from './download-project';
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

const getElementInstallPlanForProject = async ({
	compositionFile,
	compositionId,
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

	const target = await resolveCompositionComponentWithFile({
		compositionFile,
		compositionId,
		environment: makeInMemoryInsertJsxElementCodemodEnvironment({
			formatFile: formatCodemodFile,
			project,
			svgMarkupToJsx,
		}),
	});
	const elementFilePath = `${dirname(target.fileName)}/${elementFileName}`;
	if (elementFilePath === target.fileName) {
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
	onProjectChange,
	resolveDependencies,
}: {
	dependencyVersions: Record<string, string>;
	getStaticFiles: Parameters<
		typeof createBrowserStudioProjectController
	>[0]['getStaticFiles'];
	getProject: () => VirtualProject;
	onProjectChange: (project: VirtualProject) => void;
	resolveDependencies: ResolveElementDependencies | null;
}): BrowserStudioOperationsController => {
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
						formatFile: formatCodemodFile,
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
		deleteJsxNode,
		deleteStaticFile: controller.deleteStaticFile,
		downloadProject: () =>
			Promise.resolve(
				makeBrowserStudioProjectArchive({
					dependencyVersions,
					project: getProject(),
				}),
			),
		duplicateComposition,
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
					compositionFile: request.compositionFile,
					compositionId: request.compositionId,
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
		prepareElementInstall: async (request) => {
			try {
				const plan = await getElementInstallPlanForProject({
					...request,
					project: getProject(),
				});
				return {
					success: true,
					plan: {
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
		saveSequenceProps: (request) => {
			try {
				let response: Awaited<
					ReturnType<BrowserStudioOperations['saveSequenceProps']>
				> | null = null;
				const firstTarget = request.edits[0] ?? request.captionPatches?.[0];
				controller.applyMutation({
					fileName: firstTarget?.fileName ?? 'Sequence props',
					nodePathMutationFiles: null,
					mutate: (project) => {
						const result = saveSequencePropsInProject({project, request});
						response = result.response;
						return result.project;
					},
				});
				if (response === null) {
					throw new Error('Could not save sequence props');
				}

				return Promise.resolve(response);
			} catch (error) {
				return Promise.reject(error);
			}
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
		writeStaticFile: controller.writeStaticFile,
	};
};
