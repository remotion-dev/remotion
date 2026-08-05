import {
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
	findProjectFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	insertSolidIntoProject,
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
} from '@remotion/studio-codemods';
import type {
	BrowserStudioOperations,
	EventSourceEvent,
	InsertJsxElementResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {createBrowserStudioProjectController} from './browser-studio-project-controller';
import {makeBrowserStudioProjectArchive} from './download-project';
import {saveSequencePropsInProject} from './save-sequence-props';
import type {VirtualProject} from './types';

export {insertSolidIntoProject} from '@remotion/studio-codemods';

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

export const createBrowserStudioOperations = ({
	dependencyVersions,
	getStaticFiles,
	getProject,
	onProjectChange,
}: {
	dependencyVersions: Record<string, string>;
	getStaticFiles: Parameters<
		typeof createBrowserStudioProjectController
	>[0]['getStaticFiles'];
	getProject: () => VirtualProject;
	onProjectChange: (project: VirtualProject) => void;
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
		onProjectChange: (project) => {
			onProjectChange(project);
			refreshDefaultPropsSubscriptions();
			refreshSequencePropsSubscriptions();
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

	return {
		deleteStaticFile: controller.deleteStaticFile,
		downloadProject: () =>
			Promise.resolve(
				makeBrowserStudioProjectArchive({
					dependencyVersions,
					project: getProject(),
				}),
			),
		emitEvent: controller.emitEvent,
		findInFile: controller.findInFile,
		getFileSource: controller.getFileSource,
		getCompositionFile: (compositionId) =>
			getCompositionFile({compositionId, project: getProject()}),
		getCompositionComponentInfo: (request) =>
			Promise.resolve(
				getCompositionComponentInfo({project: getProject(), request}),
			),
		insertSolid: (request) => {
			try {
				controller.applyMutation({
					fileName: request.compositionFile,
					mutate: (project) =>
						insertSolidIntoProject({
							project,
							request,
						}),
				});
				return Promise.resolve({success: true});
			} catch (error) {
				return Promise.resolve({
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? (error.stack ?? '') : '',
				} satisfies InsertJsxElementResponse);
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
		subscribeToDefaultProps: ({clientId, compositionId}) => {
			const clients =
				defaultPropsSubscriptions.get(compositionId) ?? new Set<string>();
			clients.add(clientId);
			defaultPropsSubscriptions.set(compositionId, clients);
			const result = getDefaultPropsStatus(compositionId);
			lastDefaultPropsResults.set(compositionId, JSON.stringify(result));
			return Promise.resolve(result);
		},
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
