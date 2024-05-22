/**
 * @description Restarts the Remotion Studio.
 * @see [Documentation](https://www.remotion.dev/docs/studio/restart-studio)
 */

import type {RestartStudioResponse} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

export const restartStudio = (): Promise<RestartStudioResponse> => {
	return callApi('/api/restart-studio', {});
};
