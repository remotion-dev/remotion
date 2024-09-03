import type {
	InstallPackageRequest,
	InstallPackageResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

export const handleInstallPackage: ApiHandler<
	InstallPackageRequest,
	InstallPackageResponse
> = () => {
	return Promise.resolve({});
};
