import {expect, test} from 'bun:test';
import type {AudioOrVideoAsset} from 'remotion/no-react';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';
import {compressAsset} from '../compress-assets';

const makeAsset = ({
	id,
	frame,
	src,
	volume = 1,
	mediaFrame,
}: {
	id: string;
	frame: number;
	src: string;
	volume?: number;
	mediaFrame?: number;
}): AudioOrVideoAsset => {
	return {
		type: 'audio' as const,
		src,
		id,
		frame,
		volume,
		playbackRate: 1,
		mediaFrame: mediaFrame ?? frame,
		toneFrequency: 1,
		audioStartFrame: 0,
		audioStreamIndex: 0,
	};
};

test('An asset that re-appears after a gap gets two positions', () => {
	const frames = new Array(8).fill(true).map((_, frame) => {
		const inFirstRange = frame < 3;
		const inSecondRange = frame >= 5;
		if (!inFirstRange && !inSecondRange) {
			return [];
		}

		return [
			makeAsset({
				id: 'audio-1',
				frame,
				src: 'http://localhost:3000/music.mp3',
				volume: frame,
			}),
		];
	});

	const positions = calculateAssetPositions(frames);

	expect(positions).toEqual([
		{
			src: 'http://localhost:3000/music.mp3',
			type: 'audio',
			duration: 3,
			id: 'audio-1',
			startInVideo: 0,
			trimLeft: 0,
			volume: [0, 1, 2],
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
		{
			src: 'http://localhost:3000/music.mp3',
			type: 'audio',
			duration: 3,
			id: 'audio-1',
			startInVideo: 5,
			trimLeft: 5,
			volume: [5, 6, 7],
			playbackRate: 1,
			toneFrequency: 1,
			audioStartFrame: 0,
			audioStreamIndex: 0,
		},
	]);
});

test('A compressed asset resolves its src from the first occurrence', () => {
	const longSrc = `data:audio/mp3;base64,${'A'.repeat(500)}`;

	const frames = [
		[makeAsset({id: 'audio-a', frame: 0, src: longSrc})],
		[makeAsset({id: 'audio-a', frame: 1, src: 'same-as-audio-a-0'})],
		[
			makeAsset({id: 'audio-a', frame: 2, src: 'same-as-audio-a-0'}),
			// A different tag playing the same media gets compressed
			// cross-asset by `compressAsset()`
			makeAsset({id: 'audio-b', frame: 2, src: 'same-as-audio-a-0'}),
		],
	];

	const positions = calculateAssetPositions(frames);

	expect(positions.length).toBe(2);
	expect(positions[0].id).toBe('audio-a');
	expect(positions[0].src).toBe(longSrc);
	expect(positions[1].id).toBe('audio-b');
	expect(positions[1].src).toBe(longSrc);
	expect(positions[1].startInVideo).toBe(2);
});

test('A compressed asset uses the first matching uncompressed entry', () => {
	const firstSrc = `data:audio/mp3;base64,${'A'.repeat(500)}`;
	const secondSrc = `data:audio/mp3;base64,${'B'.repeat(500)}`;
	const frames = [
		[
			makeAsset({id: 'audio-source', frame: 0, src: firstSrc}),
			makeAsset({id: 'audio-source', frame: 0, src: secondSrc}),
		],
		[],
		[
			makeAsset({
				id: 'audio-reference',
				frame: 2,
				src: 'same-as-audio-source-0',
			}),
		],
	];

	const positions = calculateAssetPositions(frames);

	expect(positions[1].src).toBe(firstSrc);
});

test('Assets are returned in order of first appearance', () => {
	const frames = [
		[
			makeAsset({id: 'audio-x', frame: 0, src: 'http://localhost/x.mp3'}),
			makeAsset({id: 'audio-y', frame: 0, src: 'http://localhost/y.mp3'}),
		],
		[
			makeAsset({id: 'audio-y', frame: 1, src: 'http://localhost/y.mp3'}),
			makeAsset({id: 'audio-z', frame: 1, src: 'http://localhost/z.mp3'}),
		],
	];

	const positions = calculateAssetPositions(frames);
	expect(positions.map((p) => p.id)).toEqual(['audio-x', 'audio-y', 'audio-z']);
	expect(positions.map((p) => p.duration)).toEqual([1, 2, 1]);
});

test('Duplicate ids within a frame are deduplicated', () => {
	const frames = [
		[
			makeAsset({id: 'audio-dup', frame: 0, src: 'http://localhost/a.mp3'}),
			makeAsset({id: 'audio-dup', frame: 0, src: 'http://localhost/a.mp3'}),
		],
	];

	const positions = calculateAssetPositions(frames);
	expect(positions.length).toBe(1);
	expect(positions[0].volume).toBe(1);
	expect(positions[0].duration).toBe(1);
});

test('A late compressed asset can repeatedly close and reopen', () => {
	const numFrames = 4000;
	const sourceStart = 3000;
	const longSrc = `data:audio/mp3;base64,${'A'.repeat(500)}`;
	const previousAssets: AudioOrVideoAsset[] = [];

	const frames = new Array(numFrames).fill(true).map((_, frame) => {
		const uncompressed = [
			makeAsset({
				id: 'audio-background',
				frame,
				src: 'http://localhost:3000/background.mp3',
			}),
		];

		if (frame >= sourceStart && (frame - sourceStart) % 2 === 0) {
			uncompressed.push(
				makeAsset({
					id: 'audio-late',
					frame,
					src: longSrc,
					mediaFrame: frame - sourceStart,
				}),
			);
		}

		const compressed = uncompressed.map((asset) => {
			return compressAsset(previousAssets, asset);
		});
		previousAssets.push(...compressed);
		return compressed;
	});

	expect(frames[sourceStart][1].src).toBe(longSrc);
	expect(frames[sourceStart + 2][1].src).toBe(
		`same-as-audio-late-${sourceStart}`,
	);

	const inputBefore = structuredClone(frames);
	const positions = calculateAssetPositions(frames);
	const reopened = positions.slice(1);

	expect(frames).toEqual(inputBefore);
	expect(positions[0].duration).toBe(numFrames);
	expect(reopened.length).toBe((numFrames - sourceStart) / 2);
	for (let i = 0; i < reopened.length; i++) {
		expect(reopened[i].src).toBe(longSrc);
		expect(reopened[i].startInVideo).toBe(sourceStart + i * 2);
		expect(reopened[i].duration).toBe(1);
		expect(reopened[i].trimLeft).toBe(i * 2);
	}
});
