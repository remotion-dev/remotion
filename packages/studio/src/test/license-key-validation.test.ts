import {expect, test} from 'bun:test';
import {
	hasActiveCompanyLicense,
	type LicenseKeyDetails,
	validateLicenseKey,
} from '../components/LicenseKeyValidation';

const validLicenseKey = `rm_pub_${'a'.repeat(48)}`;

test('accepts a correctly formatted public license key', () => {
	expect(validateLicenseKey(validLicenseKey)).toEqual({
		valid: true,
		message: null,
	});
});

test('requires the public license key prefix', () => {
	expect(validateLicenseKey('invalid')).toEqual({
		valid: false,
		message: 'License key must start with "rm_pub_"',
	});
});

test('requires an alphanumeric public license key payload', () => {
	expect(validateLicenseKey(`rm_pub_${'a'.repeat(47)}!`)).toEqual({
		valid: false,
		message:
			'License key must contain only alphanumeric characters after the prefix',
	});
});

test('requires a 55-character public license key', () => {
	expect(validateLicenseKey('rm_pub_short')).toEqual({
		valid: false,
		message: 'License key must be 55 characters long',
	});
});

test('treats a null subscription as no active Company License', () => {
	const details: LicenseKeyDetails = {
		isValid: true,
		hasActiveSubscription: null,
		projectName: 'Test project',
		projectSlug: 'test-project',
	};

	expect(hasActiveCompanyLicense(details)).toBe(false);
	expect(
		hasActiveCompanyLicense({...details, hasActiveSubscription: true}),
	).toBe(true);
});
