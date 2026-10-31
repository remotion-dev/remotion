import path from 'node:path';
import type {
	PrerenderedSceneInfoRequest,
	PrerenderedSceneInfoResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {hashSceneFile, readPrerenderedSceneSidecar} from '../prerendered-scene';

export const prerenderedSceneInfoHandler: ApiHandler<
	PrerenderedSceneInfoRequest,
	PrerenderedSceneInfoResponse
> = ({input: {src}, publicDir, remotionRoot}) => {
	const sidecar = readPrerenderedSceneSidecar({publicDir, src});
	if (sidecar === null) {
		return Promise.resolve({type: 'not-prerendered'});
	}

	let stale: boolean | null = null;
	if (sidecar.sceneFile !== null && sidecar.sceneFileHash !== null) {
		try {
			stale =
				hashSceneFile(path.resolve(remotionRoot, sidecar.sceneFile)) !==
				sidecar.sceneFileHash;
		} catch {
			// The scene file was moved or deleted
			stale = true;
		}
	}

	return Promise.resolve({
		type: 'prerendered',
		compositionId: sidecar.compositionId,
		stale,
	});
};
