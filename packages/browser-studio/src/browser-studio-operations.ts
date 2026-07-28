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
import type {VirtualProject} from './types';

export {insertSolidIntoProject} from '@remotion/studio-codemods';

export const createBrowserStudioOperations = ({
	dependencyVersions,
	getProject,
	onProjectChange,
}: {
	dependencyVersions?: Record<string, string>;
	getProject: () => VirtualProject;
	onProjectChange: (project: VirtualProject) => void;
}): BrowserStudioOperations => {
	return {
		...(dependencyVersions
			? {
					downloadProject: () =>
						Promise.resolve(
							makeBrowserStudioProjectArchive({
								dependencyVersions,
								project: getProject(),
							}),
						),
				}
			: {}),
		getCompositionFile: (compositionId) =>
			getCompositionFile({compositionId, project: getProject()}),
		getCompositionComponentInfo: (request) =>
			Promise.resolve(
				getCompositionComponentInfo({project: getProject(), request}),
			),
		insertSolid: (request) => {
			try {
				const project = insertSolidIntoProject({
					project: getProject(),
					request,
				});
				onProjectChange(project);
				return Promise.resolve({success: true});
			} catch (error) {
				return Promise.resolve({
					success: false,
					reason: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? (error.stack ?? '') : '',
				} satisfies InsertJsxElementResponse);
			}
		},
	};
};
