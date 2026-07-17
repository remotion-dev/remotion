import type {
	SetPublicLicenseKeyRequest,
	SetPublicLicenseKeyResponse,
} from '@remotion/studio-shared';
import {setPublicLicenseKeyInConfig} from '../../set-public-license-key-in-config';
import type {ApiHandler} from '../api-types';

export const handleSetPublicLicenseKey: ApiHandler<
	SetPublicLicenseKeyRequest,
	SetPublicLicenseKeyResponse
> = ({remotionRoot, input: {licenseKey}}) => {
	setPublicLicenseKeyInConfig({
		remotionRoot,
		licenseKey,
	});

	return Promise.resolve({});
};
