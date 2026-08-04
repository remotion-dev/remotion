import type {
	InstallPackageResponse,
	PackageInstallSpec,
} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';

export const installPackages = (
	dependencies: readonly PackageInstallSpec[],
): Promise<InstallPackageResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('installPackages() is only available in the Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('installPackages() is not available in Read-Only Studio');
	}

	return callApi('/api/install-package', {
		dependencies: [...dependencies],
	});
};
