import {expect, test} from 'bun:test';
import {
	clearElementInstallStateForTests,
	consumeStudioProtocolTarget,
	getElementInstallTarget,
	issueStudioProtocolTarget,
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
		studioUrl: 'http://localhost:3000/older-composition',
	});
	updateElementInstallTarget({
		requestId: null,
		clientId: 'focused-tab',
		compositionFile: '/project/src/focused.tsx',
		compositionId: 'focused-composition',
		canInstall: true,
		lastFocusedAt: 2000,
		readOnly: false,
		studioUrl: 'http://localhost:3000/focused-composition',
	});
	updateElementInstallTarget({
		requestId: null,
		clientId: 'older-tab',
		compositionFile: '/project/src/older.tsx',
		compositionId: 'older-composition',
		canInstall: true,
		lastFocusedAt: 1000,
		readOnly: false,
		studioUrl: 'http://localhost:3000/older-composition',
	});

	expect(getElementInstallTarget(null)?.clientId).toBe('focused-tab');
	expect(getElementInstallTarget(null)?.studioUrl).toBe(
		'http://localhost:3000/focused-composition',
	);
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
		studioUrl: 'http://localhost:3000/first-composition',
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
		studioUrl: 'http://localhost:3000/second-composition',
	});

	expect(getElementInstallTarget(null)?.clientId).toBe('second-tab');
});

test('binds a single-use Studio Protocol token to the selected composition', () => {
	clearElementInstallStateForTests();
	updateElementInstallTarget({
		requestId: 'protocol-request',
		clientId: 'focused-tab',
		compositionFile: '/project/src/main.tsx',
		compositionId: 'Main',
		canInstall: true,
		lastFocusedAt: Date.now(),
		readOnly: false,
		studioUrl: 'http://localhost:3000/Main',
	});
	const selected = getElementInstallTarget('protocol-request');
	if (selected === null) {
		throw new Error('Expected an install target');
	}

	const issued = issueStudioProtocolTarget({now: Date.now(), target: selected});
	expect(
		consumeStudioProtocolTarget({now: Date.now(), targetId: issued.id})
			?.compositionId,
	).toBe('Main');
	expect(
		consumeStudioProtocolTarget({now: Date.now(), targetId: issued.id}),
	).toBe(null);
});

test('invalidates a token if the selected tab changes compositions', () => {
	clearElementInstallStateForTests();
	updateElementInstallTarget({
		requestId: 'protocol-request',
		clientId: 'focused-tab',
		compositionFile: '/project/src/main.tsx',
		compositionId: 'Main',
		canInstall: true,
		lastFocusedAt: Date.now(),
		readOnly: false,
		studioUrl: 'http://localhost:3000/Main',
	});
	const selected = getElementInstallTarget('protocol-request');
	if (selected === null) {
		throw new Error('Expected an install target');
	}

	const issued = issueStudioProtocolTarget({now: Date.now(), target: selected});
	updateElementInstallTarget({
		requestId: null,
		clientId: 'focused-tab',
		compositionFile: '/project/src/other.tsx',
		compositionId: 'Other',
		canInstall: true,
		lastFocusedAt: Date.now(),
		readOnly: false,
		studioUrl: 'http://localhost:3000/Other',
	});
	expect(
		consumeStudioProtocolTarget({now: Date.now(), targetId: issued.id}),
	).toBe(null);
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
		studioUrl: 'http://localhost:3000/first-composition',
	});
	updateElementInstallTarget({
		requestId: 'second-request',
		clientId: 'second-tab',
		compositionFile: '/project/src/second.tsx',
		compositionId: 'second-composition',
		canInstall: true,
		lastFocusedAt: 2000,
		readOnly: false,
		studioUrl: 'http://localhost:3000/second-composition',
	});

	expect(getElementInstallTarget('first-request')?.clientId).toBe('first-tab');
	expect(getElementInstallTarget('second-request')?.clientId).toBe(
		'second-tab',
	);
});
