import {render} from '@testing-library/react';
import React from 'react';
import {Video} from '../video';
import {expectToThrow} from './expect-to-throw';

test('It should throw if startAt prop is negative', () => {
	expectToThrow(
		() => render(<Video startAt={-40} />),
		/startAt must be greater than equal to 0 instead got -40./
	);
});

test('It should throw if endAt prop is negative', () => {
	expectToThrow(
		() => render(<Video endAt={-40} />),
		/endAt must be a positive number, instead got -40./
	);
});

test('It should throw if endAt is less than startAt', () => {
	expectToThrow(
		() => render(<Video startAt={10} endAt={1} />),
		/endAt prop must be greater than startAt prop/
	);
});

test('It should throw if endAt is not a number', () => {
	expectToThrow(
		//@ts-expect-error
		() => render(<Video endAt={'hey'} />),
		/type of endAt prop must be a number, instead got type string./
	);
});

test('It should throw if startAt is not a number', () => {
	expectToThrow(
		//@ts-expect-error
		() => render(<Video startAt={'hey'} />),
		/type of startAt prop must be a number, instead got type string./
	);
});

test('It should throw if endAt is NaN', () => {
	expectToThrow(
		() => render(<Video endAt={NaN} />),
		/endAt prop can not be NaN./
	);
});

test('It should throw if startAt is NaN or Infinity', () => {
	expectToThrow(
		() => render(<Video startAt={NaN} />),
		/startAt prop can not be NaN or Infinity./
	);
	expectToThrow(
		() => render(<Video startAt={Infinity} />),
		/startAt prop can not be NaN or Infinity./
	);
});
