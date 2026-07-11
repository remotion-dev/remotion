import {expect, test} from 'bun:test';
import {
	clearElementInstallStateForTests,
	getElementInstallTarget,
	updateElementInstallTarget,
} from '../preview-server/element-install-state';

test('uses the most recently focused Studio target even when older tabs keep updating', () => {
	clearElementInstallStateForTests();

	updateElementInstallTarget({
		requestId: null,
		clientId: 'older-tab',
		compositionFile: '/project/src/older.tsx',
		compositionId: 'older-composition',
		canInstall: true,
		lastFocusedAt: 1000,
		readOnly: false,
	});
	updateElementInstallTarget({
		requestId: null,
		clientId: 'focused-tab',
		compositionFile: '/project/src/focused.tsx',
		compositionId: 'focused-composition',
		canInstall: true,
		lastFocusedAt: 2000,
		readOnly: false,
	});
	updateElementInstallTarget({
		requestId: null,
		clientId: 'older-tab',
		compositionFile: '/project/src/older.tsx',
		compositionId: 'older-composition',
		canInstall: true,
		lastFocusedAt: 1000,
		readOnly: false,
	});

	expect(getElementInstallTarget(null)?.clientId).toBe('focused-tab');
});

test('falls back to update recency when focus timestamps match', async () => {
	clearElementInstallStateForTests();

	updateElementInstallTarget({
		requestId: null,
		clientId: 'first-tab',
		compositionFile: '/project/src/first.tsx',
		compositionId: 'first-composition',
		canInstall: true,
		lastFocusedAt: 1000,
		readOnly: false,
	});

	await new Promise((resolve) => setTimeout(resolve, 2));

	updateElementInstallTarget({
		requestId: null,
		clientId: 'second-tab',
		compositionFile: '/project/src/second.tsx',
		compositionId: 'second-composition',
		canInstall: true,
		lastFocusedAt: 1000,
		readOnly: false,
	});

	expect(getElementInstallTarget(null)?.clientId).toBe('second-tab');
});

test('can select a target for a specific request', () => {
	clearElementInstallStateForTests();

	updateElementInstallTarget({
		requestId: 'first-request',
		clientId: 'first-tab',
		compositionFile: '/project/src/first.tsx',
		compositionId: 'first-composition',
		canInstall: true,
		lastFocusedAt: 1000,
		readOnly: false,
	});
	updateElementInstallTarget({
		requestId: 'second-request',
		clientId: 'second-tab',
		compositionFile: '/project/src/second.tsx',
		compositionId: 'second-composition',
		canInstall: true,
		lastFocusedAt: 2000,
		readOnly: false,
	});

	expect(getElementInstallTarget('first-request')?.clientId).toBe('first-tab');
	expect(getElementInstallTarget('second-request')?.clientId).toBe(
		'second-tab',
	);
});
