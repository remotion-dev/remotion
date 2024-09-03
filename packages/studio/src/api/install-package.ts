import type {
	InstallPackageResponse,
	InstallablePackage,
} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

export const installPackage = (
	packageName: InstallablePackage,
): Promise<InstallPackageResponse> => {
	return callApi('/api/install-package', {packageName});
};
