import {
	getCompositionComponentInfo,
	getCompositionFile,
	insertSolidIntoProject,
} from '@remotion/studio-codemods';
import type {
	BrowserStudioOperations,
	InsertJsxElementResponse,
} from '@remotion/studio-shared';
import {makeBrowserStudioProjectArchive} from './download-project';
import {createBrowserStudioProjectController} from './browser-studio-project-controller';
import type {VirtualProject} from './types';

export {insertSolidIntoProject} from '@remotion/studio-codemods';

export type BrowserStudioOperationsController = BrowserStudioOperations & {
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
	const controller = createBrowserStudioProjectController({
		getStaticFiles,
		getProject,
		onProjectChange,
	});

	return {
		deleteStaticFile: controller.deleteStaticFile,
		downloadProject: () =>
			Promise.resolve(
				makeBrowserStudioProjectArchive({
					dependencyVersions,
					project: getProject(),
				}),
			),
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
		resetHistory: controller.resetHistory,
		subscribeToEvent: controller.subscribeToEvent,
		undo: controller.undo,
		writeStaticFile: controller.writeStaticFile,
	};
};
