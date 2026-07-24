import {expect, test} from 'bun:test';
import {nestTimelineTracks} from '../components/Timeline/nest-timeline-tracks';

test('groups nested tracks with their parent sequence', () => {
	const nested = nestTimelineTracks([
		{id: 'first-sequence', depth: 0},
		{id: 'video', depth: 1},
		{id: 'video-child', depth: 2},
		{id: 'first-sequence-sibling', depth: 1},
		{id: 'second-sequence', depth: 0},
		{id: 'image', depth: 1},
	]);

	expect(nested).toEqual([
		{
			track: {id: 'first-sequence', depth: 0},
			siblingIndex: 0,
			children: [
				{
					track: {id: 'video', depth: 1},
					siblingIndex: 0,
					children: [
						{
							track: {id: 'video-child', depth: 2},
							siblingIndex: 0,
							children: [],
						},
					],
				},
				{
					track: {id: 'first-sequence-sibling', depth: 1},
					siblingIndex: 1,
					children: [],
				},
			],
		},
		{
			track: {id: 'second-sequence', depth: 0},
			siblingIndex: 1,
			children: [
				{
					track: {id: 'image', depth: 1},
					siblingIndex: 0,
					children: [],
				},
			],
		},
	]);
});
