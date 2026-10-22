import type {
	InstallPackageResponse,
	PackageInstallSpec,
} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {withRequiredAuxiliaryPackages} from '../helpers/optional-package-dependencies';

export const installPackages = async (
	dependencies: readonly PackageInstallSpec[],
): Promise<InstallPackageResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('installPackages() is only available in the Studio');
	}

	const dependenciesWithAuxiliaryPackages =
		withRequiredAuxiliaryPackages(dependencies);

	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations !== null) {
		const response =
			await browserStudioOperations.packageInstallation.installPackages({
				dependencies: dependenciesWithAuxiliaryPackages,
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
		dependencies: dependenciesWithAuxiliaryPackages,
	});
};
