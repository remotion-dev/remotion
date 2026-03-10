import {createComposition, createStill} from './api/create-composition';
import type {
	StartStudioOptions,
	StudioServer as StartedStudioServer,
} from './node';

export {
	deleteStaticFile,
	DeleteStaticFileResponse,
} from './api/delete-static-file';
export {focusDefaultPropsPath} from './api/focus-default-props-path';
export {getStaticFiles, StaticFile} from './api/get-static-files';
export {goToComposition} from './api/go-to-composition';
export {UpdateDefaultPropsFunction} from './api/helpers/calc-new-props';
export {pause} from './api/pause';
export {play} from './api/play';
export {reevaluateComposition} from './api/reevaluate-composition';
export {restartStudio} from './api/restart-studio';
export {saveDefaultProps} from './api/save-default-props';
export {seek} from './api/seek';
export {toggle} from './api/toggle';
export {updateDefaultProps} from './api/update-default-props';
export {visualControl} from './api/visual-control';
export {watchPublicFolder} from './api/watch-public-folder';
export {watchStaticFile} from './api/watch-static-file';
export {writeStaticFile} from './api/write-static-file';
export type {StartStudioOptions, StartedStudioServer as StudioServer};

type NodeStudioModule = {
	startStudio: (options?: StartStudioOptions) => Promise<StartedStudioServer>;
};

function loadNodeStudio(): Promise<NodeStudioModule> {
	const moduleName = '@remotion/studio/node';
	return import(moduleName) as Promise<NodeStudioModule>;
}

/**
 * @description Start Remotion Studio from Node.js.
 * @see [Documentation](https://www.remotion.dev/docs/cli/studio-api)
 */
export async function startStudio(
	options?: StartStudioOptions,
): Promise<StartedStudioServer> {
	if (typeof document !== 'undefined') {
		throw new Error(
			'startStudio() is only available in Node.js and Bun, not in the browser.',
		);
	}

	const {startStudio: startStudioNode} = await loadNodeStudio();
	return startStudioNode(options);
}

export const StudioInternals = {
	createComposition,
	createStill,
};
