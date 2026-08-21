import type {
	InstallPackageResponse,
	PackageInstallSpec,
} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';

export const installPackages = async (
	dependencies: readonly PackageInstallSpec[],
): Promise<InstallPackageResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('installPackages() is only available in the Studio');
	}

	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations !== null) {
		if (browserStudioOperations.packageInstallation === undefined) {
			throw new Error(
				'Package installation is not supported by this Browser Studio',
			);
		}

		const response =
			await browserStudioOperations.packageInstallation.installPackages({
				dependencies: [...dependencies],
			});
		if (!response.success) {
			const error = new Error(response.reason);
			error.stack = response.stack;
			throw error;
		}

		return {};
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('installPackages() is not available in Read-Only Studio');
	}

	return callApi('/api/install-package', {
		dependencies: [...dependencies],
	});
};
