import {calculateTimeline} from '../editor/helpers/calculate-timeline';

test('Should calculate timeline with no sequences', () => {
	const calculated = calculateTimeline({
		sequences: [],
		sequenceDuration: 100,
	});
	expect(calculated).toEqual([
		{
			depth: 0,
			sequence: {
				displayName: '',
				duration: 100,
				from: 0,
				id: 'seq',
				parent: null,
				rootId: '-',
				showInTimeline: true,
				type: 'sequence',
			},
		},
	]);
});

test('Should calculate a basic timline', () => {
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
			},
		],
		sequenceDuration: 100,
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
				type: 'sequence',
			},
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
			},
			{
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
			},
		],
		sequenceDuration: 100,
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
				type: 'sequence',
			},
		},
		{
			depth: 1,
			sequence: {
				displayName: 'Audio',
				duration: 100,
				from: 0,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
			},
		},
	]);
});
