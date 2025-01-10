import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, test} from 'bun:test';
import React from 'react';
import {Composition} from '../Composition.js';
import {resolveVideoConfig} from '../resolve-video-config.js';
import {expectToThrow} from './expect-to-throw.js';

afterEach(() => {
	cleanup();
});

const AnyComp: React.FC = () => null;

describe('Composition-validation render should throw with invalid props', () => {
	test('It should throw if multiple components have the same id', () => {
		expectToThrow(
			() =>
				resolveVideoConfig({
					compositionDurationInFrames: 100,
					calculateMetadata: null,
					compositionFps: 30,
					compositionHeight: 100,
					compositionId: 'id',
					compositionWidth: null,
					originalProps: {},
					defaultProps: {},
					signal: new AbortController().signal,
				}),

			/The "width" prop of the "<Composition \/>" component with the id "id" must be a number, but you passed a value of type undefined/,
		);
	});
	describe('Throw with invalid height props', () => {
		test('It should throw if height is a negative number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: -100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),

				/The "height" prop of the "<Composition \/>" component with the id "id" must be positive, but got -100./,
			);
		});
		test('It should throw if height=0 is boundary off-point', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 0,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "height" prop of the "<Composition \/>" component with the id "id" must be positive, but got 0./,
			);
		});
		test('It should throw if height is not a number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						// @ts-expect-error
						compositionHeight: '100',
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						editorProps: {},
						signal: new AbortController().signal,
					}),
				/The "height" prop of the "<Composition \/>" component with the id "id" must be a number, but you passed a value of type string/,
			);
		});
		test('It should throw if height is not an integer', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100.01,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "height" prop of the "<Composition \/>" component with the id "id" must be an integer, but is 100.01./,
			);
		});
	});
	describe('Throw with invalid width props', () => {
		test('It should throw if width is a negative number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: -100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "width" prop of the "<Composition \/>" component with the id "id" must be positive, but got -100./,
			);
		});
		test('It should throw if width=0 is boundary off-point', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 0,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "width" prop of the "<Composition \/>" component with the id "id" must be positive, but got 0./,
			);
		});
		test('It should throw if width is not a number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						// @ts-expect-error
						compositionWidth: '100',
						defaultProps: {},
						editorProps: {},
						signal: new AbortController().signal,
					}),
				/The "width" prop of the "<Composition \/>" component with the id "id" must be a number, but you passed a value of type string/,
			);
		});
	});
	describe('Throw with invalid durationInFrames', () => {
		test('It should throw if durationInFrames of a composition is a negative number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: -100,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "durationInFrames" prop of the "<Composition \/>" component with the id "id" must be positive, but got -100./,
			);
		});
		test('It should throw if durationInFrames=0 of a composition is boundary off-point', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 0,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "durationInFrames" prop of the "<Composition \/>" component with the id "id" must be positive, but got 0./,
			);
		});
		test('It should throw if durationInFrames of a composition is not an integer', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 0.11,
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/The "durationInFrames" prop of the "<Composition \/>" component with the id "id" must be an integer, but got 0.11./,
			);
		});
		test('It should throw if durationInFrames of a composition is not a number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						// @ts-expect-error
						compositionDurationInFrames: '100',
						calculateMetadata: null,
						compositionFps: 30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						editorProps: {},
						signal: new AbortController().signal,
					}),
				/The "durationInFrames" prop of the "<Composition \/>" component with the id "id" must be a number, but you passed a value of type string/,
			);
		});
	});
	describe('Throw with invalid fps', () => {
		test('It should throw if fps is of a composition is negative', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: -30,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/"fps" must be positive, but got -30./,
			);
		});
		test('It should throw if fps=0 of a composition is boundary off-point', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						compositionFps: 0,
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						originalProps: {},
						signal: new AbortController().signal,
					}),
				/"fps" must be positive, but got 0./,
			);
		});

		test('It should throw if fps of a composition is not a number', () => {
			expectToThrow(
				() =>
					resolveVideoConfig({
						compositionDurationInFrames: 100,
						calculateMetadata: null,
						// @ts-expect-error
						compositionFps: '30',
						compositionHeight: 100,
						compositionId: 'id',
						compositionWidth: 100,
						defaultProps: {},
						editorProps: {},
						signal: new AbortController().signal,
					}),
				/"fps" must be a number, but you passed a value of type string/,
			);
		});
	});
});

describe('Composition-validation render should NOT throw with valid props', () => {
	describe('Not throw with valid height props', () => {
		test('It should not throw if height is a positive number', () => {
			expect(() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						width={100}
						id="id"
					/>,
				),
			).not.toThrow();
		});
		test('It should not throw if height=1 is boundary on-point', () => {
			expect(() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={1}
						width={100}
						id="id"
					/>,
				),
			).not.toThrow();
		});
	});

	describe('Not throw with valid width props', () => {
		test('It should not throw if width is a positive number', () => {
			expect(() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						width={100}
						id="id"
					/>,
				),
			).not.toThrow();
		});
		test('It should not throw if width=1 is boundary on-point', () => {
			expect(() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						width={1}
						id="id"
					/>,
				),
			).not.toThrow();
		});
	});
	test('It should not throw if durationInFrames=1 of a composition is boundary on-point', () => {
		expect(() =>
			render(
				<Composition
					lazyComponent={() => Promise.resolve({default: AnyComp})}
					durationInFrames={1}
					fps={30}
					height={100}
					width={100}
					id="id"
				/>,
			),
		).not.toThrow();
	});
	test('It should not throw if fps=1 of a composition is boundary on-point', () => {
		expect(() =>
			render(
				<Composition
					lazyComponent={() => Promise.resolve({default: AnyComp})}
					durationInFrames={100}
					fps={1}
					height={100}
					width={100}
					id="id"
				/>,
			),
		).not.toThrow();
	});
	test('It should not allow an array as default props', () => {
		expectToThrow(
			() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={1}
						height={100}
						width={100}
						id="id"
						defaultProps={[]}
					/>,
				),
			/"defaultProps" must be an object, an array was passed for composition "id"/,
		);
	});
});

test('should resolve props correctly with no calculateMetadata()', async () => {
	const resolved = await resolveVideoConfig({
		calculateMetadata: null,
		compositionDurationInFrames: 100,
		compositionFps: 30,
		compositionHeight: 1080,
		compositionId: 'test',
		compositionWidth: 1920,
		originalProps: {
			a: 'b',
			c: 'd',
		},
		signal: new AbortController().signal,
		defaultProps: {
			a: 'b',
		},
	});
	expect(resolved.props).toEqual({
		a: 'b',
		c: 'd',
	});
});
