import {CodemodsInternals} from '@remotion/codemods';
import type {
	RestorePrerenderedSceneRequest,
	RestorePrerenderedSceneResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {commitNodeCodemod} from '../commit-node-codemod';
import {readPrerenderedSceneSidecar} from '../prerendered-scene';

export const restorePrerenderedSceneHandler: ApiHandler<
	RestorePrerenderedSceneRequest,
	RestorePrerenderedSceneResponse
> = ({input: {fileName, nodePath, src}, publicDir, remotionRoot, logLevel}) => {
	const sidecar = readPrerenderedSceneSidecar({publicDir, src});
	if (sidecar === null) {
		return Promise.resolve({
			success: false,
			reason: 'This video was not rendered from a scene',
			stack: '',
		});
	}

	return commitNodeCodemod({
		remotionRoot,
		logLevel,
		fileName,
		nodePath,
		codemod: ({project, node}) =>
			CodemodsInternals.replaceJsxElementWithSource({
				project,
				node,
				source: sidecar.source,
				importStatements: sidecar.importStatements,
			}),
		label: 'Restored unrendered scene',
		entryType: 'restore-prerendered-scene',
	}).then(
		({nodePathMutation}) => ({success: true as const, nodePathMutation}),
		(error) => ({
			success: false as const,
			reason: (error as Error).message,
			stack: (error as Error).stack ?? '',
		}),
	);
};
