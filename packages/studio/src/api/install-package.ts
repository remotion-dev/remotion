import type {
	InstallPackageResponse,
	InstallablePackage,
} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

export const installPackages = (
	packageNames: InstallablePackage[],
): Promise<InstallPackageResponse> => {
	return callApi('/api/install-package', {packageNames});
};
