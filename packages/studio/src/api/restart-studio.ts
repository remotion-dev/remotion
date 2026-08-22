/**
 * @description Restarts the Remotion Studio.
 * @see [Documentation](https://www.remotion.dev/docs/studio/restart-studio)
 */

import type {RestartStudioResponse} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';

export const restartStudio = (): Promise<RestartStudioResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('restartStudio() is only available in the Studio');
	}

	if (getBrowserStudioOperations() !== null) {
		throw new Error('restartStudio() is not supported in Browser Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('restartStudio() is not available in read-only Studio');
	}

	return callApi('/api/restart-studio', {});
};
