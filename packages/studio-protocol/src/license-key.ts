import * as z from 'zod/mini';

const publicLicenseKeySchema = z
	.string()
	.check(z.regex(/^rm_pub_[a-zA-Z0-9]{48}$/));

export const isValidPublicLicenseKey = (
	licenseKey: unknown,
): licenseKey is string =>
	z.safeParse(publicLicenseKeySchema, licenseKey).success;
