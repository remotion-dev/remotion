const publicLicenseKeyPattern = /^rm_pub_[a-zA-Z0-9]{48}$/;

export const isValidPublicLicenseKey = (
	licenseKey: unknown,
): licenseKey is string =>
	typeof licenseKey === 'string' && publicLicenseKeyPattern.test(licenseKey);
