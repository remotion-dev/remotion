import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {Loop} from '../loop/index.js';
import {expectToThrow} from './expect-to-throw.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

describe('Loop-validation render should throw with invalid props', () => {
	describe('Throw with invalid durationInFrames prop', () => {
		test('It should throw if Loop has non-number durationInFrames', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							{/* @ts-expect-error */}
							<Loop durationInFrames={'1'}>hi</Loop>
						</WrapSequenceContext>,
					),
				/The "durationInFrames" prop of the <Loop \/> component must be a number, but you passed a value of type string/,
			);
		});
		test('It should throw if Loop has non-integer durationInFrames', () => {
			expect(
				renderToString(
					<WrapSequenceContext>
						<WrapSequenceContext>
							<Loop durationInFrames={1.1}>hi</Loop>
						</WrapSequenceContext>
					</WrapSequenceContext>,
				),
			).toBe(
				'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex">hi</div>',
			);
		});
		test('It should throw if Loop has a negative duration', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Loop durationInFrames={-1}>hi</Loop>
						</WrapSequenceContext>,
					),
				/The "durationInFrames" prop of the <Loop \/> component must be positive, but got -1./,
			);
		});
	});
	describe('Throw with invalid times prop', () => {
		test('It should throw if Loop has non-number times', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							{/* @ts-expect-error */}
							<Loop durationInFrames={50} times="1">
								hi
							</Loop>
						</WrapSequenceContext>,
					),
				/You passed to "times" an argument of type string, but it must be a number./,
			);
		});
		test('It should throw if Loop has non-integer times', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Loop durationInFrames={50} times={1.1}>
								hi
							</Loop>
						</WrapSequenceContext>,
					),
				/The "times" prop of a loop must be an integer, but got 1.1./,
			);
		});
	});
});
describe('Should NOT throw with valid props', () => {
	test('It should allow null as children', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Loop durationInFrames={50}>{null}</Loop>
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});
	test('It should allow undefined as children', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Loop durationInFrames={50}>{undefined}</Loop>
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});
});
