import type {SetPublicLicenseKeyResponse} from '@remotion/studio-shared';
import {getRemotionEnvironment} from 'remotion';
import {callApi} from '../components/call-api';

export const setPublicLicenseKey = (
	licenseKey: string,
): Promise<SetPublicLicenseKeyResponse> => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('setPublicLicenseKey() is only available in the Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error(
			'setPublicLicenseKey() is not available in Read-Only Studio',
		);
	}

	return callApi('/api/set-public-license-key', {licenseKey});
};
