import {expect, test} from 'bun:test';
import {
	canEditStudioConfig,
	canInstallPackagesInStudio,
	getAvailableSettingsTabs,
	getSafeSettingsTab,
} from '../helpers/settings-tab-availability';

test('shows every applicable setting in connected interactive Studio', () => {
	const studioMode = {
		isBrowserStudio: false,
		previewServerConnected: true,
		readOnlyStudio: false,
	};

	expect(canEditStudioConfig(studioMode)).toBe(true);
	expect(canInstallPackagesInStudio(studioMode)).toBe(true);
	expect(
		getAvailableSettingsTabs({
			...studioMode,
			packageManagerAvailable: true,
			showUpdates: true,
		}),
	).toEqual([
		'studio',
		'rendering',
		'shortcuts',
		'packages',
		'skills',
		'models',
		'apps',
		'license',
		'updates',
	]);
});

test('keeps only read-only controls when the preview server is detached', () => {
	const studioMode = {
		isBrowserStudio: false,
		previewServerConnected: false,
		readOnlyStudio: false,
	};

	expect(canEditStudioConfig(studioMode)).toBe(false);
	expect(canInstallPackagesInStudio(studioMode)).toBe(false);
	expect(
		getAvailableSettingsTabs({
			...studioMode,
			packageManagerAvailable: true,
			showUpdates: false,
		}),
	).toEqual(['shortcuts', 'models']);
});

test('hides model and server-backed settings in deployed read-only Studio', () => {
	const studioMode = {
		isBrowserStudio: false,
		previewServerConnected: false,
		readOnlyStudio: true,
	};
	const availableTabs = getAvailableSettingsTabs({
		...studioMode,
		packageManagerAvailable: true,
		showUpdates: false,
	});

	expect(canEditStudioConfig(studioMode)).toBe(false);
	expect(canInstallPackagesInStudio(studioMode)).toBe(false);
	expect(availableTabs).toEqual(['shortcuts']);
	expect(getSafeSettingsTab('license', availableTabs)).toBe('shortcuts');
});

test('keeps virtual filesystem actions in Browser Studio', () => {
	const studioMode = {
		isBrowserStudio: true,
		previewServerConnected: true,
		readOnlyStudio: true,
	};

	expect(canEditStudioConfig(studioMode)).toBe(false);
	expect(canInstallPackagesInStudio(studioMode)).toBe(true);
	expect(
		getAvailableSettingsTabs({
			...studioMode,
			packageManagerAvailable: false,
			showUpdates: false,
		}),
	).toEqual(['shortcuts', 'packages', 'models']);
});
