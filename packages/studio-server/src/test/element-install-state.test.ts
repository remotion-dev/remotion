import {expect, test} from 'bun:test';
import {
	clearElementInstallStateForTests,
	consumeStudioProtocolTarget,
	getElementInstallTarget,
	issueStudioProtocolTarget,
	updateElementInstallTarget,
} from '../preview-server/element-install-state';

const updateTarget = ({
	canInstall = true,
	clientId = 'focused-tab',
	compositionId = 'Main',
	lastFocusedAt = Date.now(),
	readOnly = false,
	requestId = 'protocol-request',
}: {
	readonly canInstall?: boolean;
	readonly clientId?: string;
	readonly compositionId?: string | null;
	readonly lastFocusedAt?: number;
	readonly readOnly?: boolean;
	readonly requestId?: string | null;
}) => {
	updateElementInstallTarget({
		requestId,
		clientId,
		compositionFile:
			compositionId === null ? null : `/project/src/${compositionId}.tsx`,
		compositionId,
		canInstall,
		lastFocusedAt,
		readOnly,
		studioUrl: `http://localhost:3000/${compositionId ?? ''}`,
	});
};

test('uses the most recently focused Studio target even when older tabs keep updating', () => {
	clearElementInstallStateForTests();
	updateTarget({clientId: 'older-tab', lastFocusedAt: 1000, requestId: null});
	updateTarget({clientId: 'focused-tab', lastFocusedAt: 2000, requestId: null});
	updateTarget({clientId: 'older-tab', lastFocusedAt: 1000, requestId: null});

	expect(getElementInstallTarget(null)?.clientId).toBe('focused-tab');
});

test('binds install tokens to one origin, purpose and composition', () => {
	clearElementInstallStateForTests();
	updateTarget({});
	const selected = getElementInstallTarget('protocol-request');
	if (selected === null) {
		throw new Error('Expected an install target');
	}

	const wrongPurpose = issueStudioProtocolTarget({
		now: Date.now(),
		origin: 'https://example.com',
		purpose: 'install-element',
		target: selected,
	});
	expect(
		consumeStudioProtocolTarget({
			now: Date.now(),
			origin: 'https://example.com',
			purpose: 'set-license-key',
			targetId: wrongPurpose.id,
		}),
	).toBe(null);

	const changedComposition = issueStudioProtocolTarget({
		now: Date.now(),
		origin: 'https://example.com',
		purpose: 'install-element',
		target: selected,
	});
	updateTarget({compositionId: 'Other', requestId: null});
	expect(
		consumeStudioProtocolTarget({
			now: Date.now(),
			origin: 'https://example.com',
			purpose: 'install-element',
			targetId: changedComposition.id,
		}),
	).toBe(null);

	updateTarget({});
	const current = getElementInstallTarget('protocol-request');
	if (current === null) {
		throw new Error('Expected an install target');
	}

	const wrongOrigin = issueStudioProtocolTarget({
		now: Date.now(),
		origin: 'https://example.com',
		purpose: 'install-element',
		target: current,
	});
	expect(
		consumeStudioProtocolTarget({
			now: Date.now(),
			origin: 'https://other.example',
			purpose: 'install-element',
			targetId: wrongOrigin.id,
		}),
	).toBe(null);
});

test('license-key targets are project-level, single-use and invalidated by read-only mode', () => {
	clearElementInstallStateForTests();
	updateTarget({canInstall: false, compositionId: null});
	const selected = getElementInstallTarget('protocol-request');
	if (selected === null) {
		throw new Error('Expected a Studio target');
	}

	const issued = issueStudioProtocolTarget({
		now: Date.now(),
		origin: 'https://remotion.pro',
		purpose: 'set-license-key',
		target: selected,
	});
	expect(
		consumeStudioProtocolTarget({
			now: Date.now(),
			origin: 'https://remotion.pro',
			purpose: 'set-license-key',
			targetId: issued.id,
		})?.clientId,
	).toBe('focused-tab');
	expect(
		consumeStudioProtocolTarget({
			now: Date.now(),
			origin: 'https://remotion.pro',
			purpose: 'set-license-key',
			targetId: issued.id,
		}),
	).toBe(null);

	const readOnlyToken = issueStudioProtocolTarget({
		now: Date.now(),
		origin: 'https://remotion.pro',
		purpose: 'set-license-key',
		target: selected,
	});
	updateTarget({canInstall: false, compositionId: null, readOnly: true});
	expect(
		consumeStudioProtocolTarget({
			now: Date.now(),
			origin: 'https://remotion.pro',
			purpose: 'set-license-key',
			targetId: readOnlyToken.id,
		}),
	).toBe(null);
});
