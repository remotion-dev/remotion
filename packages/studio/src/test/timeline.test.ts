import {expect, test} from 'bun:test';
import {calculateTimeline} from '../helpers/calculate-timeline';

test('Should calculate timeline with no sequences', () => {
	const calculated = calculateTimeline({
		sequences: [],
	});
	expect(calculated).toEqual([]);
});

test('Should calculate a basic timeline', () => {
	const calculated = calculateTimeline({
		sequences: [
			{
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				stack: null,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
			},
		],
	});
	expect(calculated).toEqual([
		{
			depth: 0,
			sequence: {
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				stack: null,
				type: 'sequence',
				nonce: [[0, 0]],
			},
			hash: '-Audio-100-0-sequence----0',
		},
	]);
});

test('Should follow order of nesting', () => {
	const calculated = calculateTimeline({
		sequences: [
			{
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				stack: null,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
			},
			{
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.1',
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				stack: null,
			},
		],
	});
	expect(calculated).toEqual([
		{
			sequence: {
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.1',
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				stack: null,
			},
			depth: 0,
			hash: '-Audio-100-0-sequence----0',
		},
		{
			sequence: {
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				stack: null,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
			},
			depth: 1,
			hash: '-Audio-100-0-sequence----0-Audio-100-0-sequence----0',
		},
	]);
});
