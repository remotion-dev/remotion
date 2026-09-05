/**
 * @description Shuts down the Remotion Studio.
 * @see [Documentation](https://www.remotion.dev/docs/studio/shut-down-studio)
 */

import type {ShutdownStudioResponse} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';

export const shutDownStudio = (): Promise<ShutdownStudioResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('shutDownStudio() is only available in the Studio');
	}

	if (getBrowserStudioOperations() !== null) {
		throw new Error('shutDownStudio() is not supported in Browser Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('shutDownStudio() is not available in read-only Studio');
	}

	return callApi('/api/shutdown-studio', {});
};
