import {expect, test} from 'bun:test';
import {getMostExpensiveChunks} from '../most-expensive-chunks';

test('Should calculate most expensive chunks', () => {
	const most = getMostExpensiveChunks({
		parsedTimings: [
			{
				chunk: 0,
				rendered: 1000,
				start: 0,
			},
			{
				chunk: 1,
				rendered: 4000,
				start: 2000,
			},
			{
				chunk: 2,
				rendered: 5000,
				start: 2000,
			},
			{
				chunk: 3,
				rendered: 3000,
				start: 2000,
			},
			{
				chunk: 4,
				rendered: 100000,
				start: 2000,
			},
			{
				chunk: 5,
				rendered: 2001,
				start: 2000,
			},
			{
				chunk: 6,
				rendered: 2500,
				start: 2000,
			},
		],
		framesPerFunction: 10,
		firstFrame: 0,
		lastFrame: 99,
	});

	expect(most).toEqual([
		{timeInMilliseconds: 98000, chunk: 4, frameRange: [40, 49]},
		{timeInMilliseconds: 3000, chunk: 2, frameRange: [20, 29]},
		{timeInMilliseconds: 2000, chunk: 1, frameRange: [10, 19]},
		{timeInMilliseconds: 1000, chunk: 0, frameRange: [0, 9]},
		{timeInMilliseconds: 1000, chunk: 3, frameRange: [30, 39]},
	]);
});

test('Render starting from frame 10 should have correct offset', () => {
	const framesPerFunction = 10;
	const firstFrame = 10;
	const lastFrame = 99;
	const most = getMostExpensiveChunks({
		parsedTimings: [
			{
				chunk: 0,
				rendered: 1000,
				start: 0,
			},
			{
				chunk: 1,
				rendered: 4000,
				start: 2000,
			},
			{
				chunk: 2,
				rendered: 5000,
				start: 2000,
			},
			{
				chunk: 3,
				rendered: 3000,
				start: 2000,
			},
			{
				chunk: 4,
				rendered: 100000,
				start: 2000,
			},
			{
				chunk: 5,
				rendered: 2001,
				start: 2000,
			},
			{
				chunk: 6,
				rendered: 2500,
				start: 2000,
			},
		],
		framesPerFunction,
		firstFrame,
		lastFrame,
	});

	expect(most).toEqual([
		{timeInMilliseconds: 98000, chunk: 4, frameRange: [50, 59]},
		{timeInMilliseconds: 3000, chunk: 2, frameRange: [30, 39]},
		{timeInMilliseconds: 2000, chunk: 1, frameRange: [20, 29]},
		{timeInMilliseconds: 1000, chunk: 0, frameRange: [10, 19]},
		{timeInMilliseconds: 1000, chunk: 3, frameRange: [40, 49]},
	]);
});

test('Render starting from frame 10 and last chunk in most expensive should be corret', () => {
	const framesPerFunction = 10;
	const firstFrame = 10;
	const lastFrame = 79;
	const most = getMostExpensiveChunks({
		parsedTimings: [
			{
				chunk: 0,
				rendered: 1000,
				start: 0,
			},
			{
				chunk: 1,
				rendered: 4000,
				start: 2000,
			},
			{
				chunk: 2,
				rendered: 5000,
				start: 2000,
			},
			{
				chunk: 3,
				rendered: 3000,
				start: 2000,
			},
			{
				chunk: 4,
				rendered: 100000,
				start: 2000,
			},
			{
				chunk: 5,
				rendered: 2001,
				start: 2000,
			},
			{
				chunk: 6,
				rendered: 125000,
				start: 2000,
			},
		],
		framesPerFunction,
		firstFrame,
		lastFrame,
	});

	expect(most).toEqual([
		{timeInMilliseconds: 123000, chunk: 6, frameRange: [70, 79]},
		{timeInMilliseconds: 98000, chunk: 4, frameRange: [50, 59]},
		{timeInMilliseconds: 3000, chunk: 2, frameRange: [30, 39]},
		{timeInMilliseconds: 2000, chunk: 1, frameRange: [20, 29]},
		{timeInMilliseconds: 1000, chunk: 0, frameRange: [10, 19]},
	]);
});
