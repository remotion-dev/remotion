import {expect, test} from 'bun:test';
import {makeMediaResourceManager} from '../media-resource-manager';

test('shares active media resources and their computed values', async () => {
	const manager = makeMediaResourceManager();
	let creations = 0;
	let disposals = 0;
	let valueComputations = 0;

	const acquire = () =>
		manager.acquire({
			key: 'video.mp4',
			create: () => {
				creations++;
				return {
					resource: {creation: creations},
					dispose: () => disposals++,
				};
			},
		});

	const metadataLease = acquire();
	const playbackLease = acquire();
	const metadataDuration = metadataLease.getOrCreateValue('duration', () => {
		valueComputations++;
		return Promise.resolve(10);
	});
	const playbackDuration = playbackLease.getOrCreateValue<Promise<number>>(
		'duration',
		() => {
			throw new Error('Duration should be shared');
		},
	);

	expect(playbackLease.resource).toBe(metadataLease.resource);
	expect(playbackDuration).toBe(metadataDuration);
	expect(await playbackDuration).toBe(10);
	expect({creations, disposals, valueComputations}).toEqual({
		creations: 1,
		disposals: 0,
		valueComputations: 1,
	});

	metadataLease.release();
	metadataLease.release();
	await Promise.resolve();
	expect(disposals).toBe(0);

	playbackLease.release();
	const handoffLease = acquire();
	await Promise.resolve();
	expect(handoffLease.resource).toBe(playbackLease.resource);
	expect(disposals).toBe(0);

	handoffLease.release();
	await Promise.resolve();
	expect(disposals).toBe(1);

	const nextLease = acquire();
	expect(nextLease.resource).not.toBe(playbackLease.resource);
	expect(creations).toBe(2);

	manager.invalidate('video.mp4');
	expect(disposals).toBe(1);
	const replacementLease = acquire();
	expect(replacementLease.resource).not.toBe(nextLease.resource);
	expect(creations).toBe(3);

	nextLease.release();
	await Promise.resolve();
	expect(disposals).toBe(2);

	replacementLease.release();
	await Promise.resolve();
	expect(disposals).toBe(3);
});
