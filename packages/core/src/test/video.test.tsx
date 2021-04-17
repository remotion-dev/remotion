import {render} from '@testing-library/react';
import React from 'react';
import {Video} from '../video';
import {expectToThrow} from './expect-to-throw';

test('It should throw if startFrom prop is negative', () => {
	expectToThrow(
		() => render(<Video startFrom={-40} />),
		/startFrom must be greater than equal to 0 instead got -40./
	);
});

test('It should throw if endAt prop is negative', () => {
	expectToThrow(
		() => render(<Video endAt={-40} />),
		/endAt must be a positive number, instead got -40./
	);
});

test('It should throw if endAt is less than startFrom', () => {
	expectToThrow(
		() => render(<Video startFrom={10} endAt={1} />),
		/endAt prop must be greater than startFrom prop/
	);
});

test('It should throw if endAt is not a number', () => {
	expectToThrow(
		//@ts-expect-error
		() => render(<Video endAt={'hey'} />),
		/type of endAt prop must be a number, instead got type string./
	);
});

test('It should throw if startFrom is not a number', () => {
	expectToThrow(
		//@ts-expect-error
		() => render(<Video startFrom={'hey'} />),
		/type of startFrom prop must be a number, instead got type string./
	);
});

test('It should throw if endAt is NaN', () => {
	expectToThrow(
		() => render(<Video endAt={NaN} />),
		/endAt prop can not be NaN./
	);
});

test('It should throw if startFrom is NaN or Infinity', () => {
	expectToThrow(
		() => render(<Video startFrom={NaN} />),
		/startFrom prop can not be NaN or Infinity./
	);
	expectToThrow(
		() => render(<Video startFrom={Infinity} />),
		/startFrom prop can not be NaN or Infinity./
	);
});
