import {expect, test} from 'bun:test';
import {getLatestRemotionVersion} from '../latest-remotion-version';

test('uses the latest Remotion version from the registry response', async () => {
	const warnings: string[] = [];
	const version = await getLatestRemotionVersion({
		getRegistry: () => 'https://registry.example.com',
		getPackageJsonForRemotion: () =>
			Promise.resolve(JSON.stringify({'dist-tags': {latest: '5.0.0'}})),
		fallbackVersion: '4.0.0',
		onError: (message) => warnings.push(message),
	});

	expect(version).toBe('5.0.0');
	expect(warnings).toEqual([]);
});

test('falls back if a private registry returns a non-JSON auth response', async () => {
	const warnings: string[] = [];
	const version = await getLatestRemotionVersion({
		getRegistry: () => 'https://registry.example.com',
		getPackageJsonForRemotion: () =>
			Promise.resolve('<html>Authentication required</html>'),
		fallbackVersion: '4.0.0',
		onError: (message) => warnings.push(message),
	});

	expect(version).toBe('4.0.0');
	expect(warnings).toHaveLength(1);
	expect(warnings[0]).toContain(
		'Could not fetch the latest Remotion version from https://registry.example.com',
	);
	expect(warnings[0]).toContain('Continuing with 4.0.0.');
});

test('falls back if the registry request fails', async () => {
	const warnings: string[] = [];
	const version = await getLatestRemotionVersion({
		getRegistry: () => 'https://registry.example.com',
		getPackageJsonForRemotion: () =>
			Promise.reject(new Error('401 Unauthorized')),
		fallbackVersion: '4.0.0',
		onError: (message) => warnings.push(message),
	});

	expect(version).toBe('4.0.0');
	expect(warnings).toEqual([
		'Could not fetch the latest Remotion version from https://registry.example.com (401 Unauthorized). Continuing with 4.0.0.',
	]);
});
