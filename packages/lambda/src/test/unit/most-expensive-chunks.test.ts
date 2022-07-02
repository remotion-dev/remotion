import {getMostExpensiveChunks} from '../../shared/get-most-expensive-chunks';

test('Should calculate most expensive chunks', () => {
	const most = getMostExpensiveChunks(
		[
			{
				chunk: 0,
				rendered: 1000,
				start: 0,
				renderId: 'abc',
			},
			{
				chunk: 1,
				rendered: 4000,
				start: 2000,
				renderId: 'abc',
			},
			{
				chunk: 2,
				rendered: 5000,
				start: 2000,
				renderId: 'abc',
			},
			{
				chunk: 3,
				rendered: 3000,
				start: 2000,
				renderId: 'abc',
			},
			{
				chunk: 4,
				rendered: 100000,
				start: 2000,
				renderId: 'abc',
			},
			{
				chunk: 5,
				rendered: 2001,
				start: 2000,
				renderId: 'abc',
			},
			{
				chunk: 6,
				rendered: 2500,
				start: 2000,
				renderId: 'abc',
			},
		],
		10
	);

	expect(most).toEqual([
		{timeInMilliseconds: 98000, chunk: 4, frameRange: [40, 49]},
		{timeInMilliseconds: 3000, chunk: 2, frameRange: [20, 29]},
		{timeInMilliseconds: 2000, chunk: 1, frameRange: [10, 19]},
		{timeInMilliseconds: 1000, chunk: 0, frameRange: [0, 9]},
		{timeInMilliseconds: 1000, chunk: 3, frameRange: [30, 39]},
	]);
});
