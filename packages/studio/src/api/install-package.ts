import type {InstallPackageResponse} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

export const installPackage = (): Promise<InstallPackageResponse> => {
	return callApi('/api/install-package', {});
};
