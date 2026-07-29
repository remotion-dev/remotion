import {
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	insertSolidIntoProject,
} from '@remotion/studio-codemods';
import type {
	BrowserStudioOperations,
	EventSourceEvent,
	InsertJsxElementResponse,
} from '@remotion/studio-shared';
import {createBrowserStudioProjectController} from './browser-studio-project-controller';
import {makeBrowserStudioProjectArchive} from './download-project';
import type {VirtualProject} from './types';

export {insertSolidIntoProject} from '@remotion/studio-codemods';

export type BrowserStudioOperationsController = BrowserStudioOperations & {
	emitEvent: (event: EventSourceEvent) => void;
	resetHistory: () => void;
};

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
	let refreshDefaultPropsSubscriptions = () => undefined;
	const controller = createBrowserStudioProjectController({
		getStaticFiles,
		getProject,
		onProjectChange: (project) => {
			onProjectChange(project);
			refreshDefaultPropsSubscriptions();
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
		resetHistory: () => {
			controller.resetHistory();
			refreshDefaultPropsSubscriptions();
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
		writeStaticFile: controller.writeStaticFile,
	};
};
