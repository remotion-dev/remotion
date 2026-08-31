import {expect, test} from 'bun:test';
import {StudioProtocolInternals} from '../index';

const installCapability = {
	type: 'install-element' as const,
	payloadType: 'remotion-element' as const,
	payloadVersions: [1],
	target: {
		id: 'target',
		expiresAt: 2_000,
		lastFocusedAt: 1_000,
		compositionId: 'Main',
	},
	futureCapabilityMetadata: true,
};

const descriptor = {
	protocol: 'remotion-studio-protocol' as const,
	protocolVersion: 1 as const,
	studioVersion: '4.0.519',
	projectName: 'Project',
	capabilities: [installCapability, {type: 'future-capability'}],
	futureDescriptorMetadata: true,
};

test('filters future capabilities, preserves extensions, and rejects duplicates', () => {
	const parsed =
		StudioProtocolInternals.parseStudioProtocolDescriptor(descriptor);
	expect(parsed).toEqual({
		...descriptor,
		capabilities: [installCapability],
	});

	expect(
		StudioProtocolInternals.parseStudioProtocolDescriptor({
			...descriptor,
			capabilities: [installCapability, installCapability],
		}),
	).toBe(null);
});
