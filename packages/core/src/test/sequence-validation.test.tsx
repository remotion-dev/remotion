import {afterEach, describe, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {Sequence} from '../Sequence.js';
import {expectToThrow} from './expect-to-throw.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

describe('Composition-validation render should throw with invalid props', () => {
	describe('Throw with invalid duration props', () => {
		test('It should throw if Sequence has non-integer durationInFrames', () => {
			expect(
				renderToString(
					<WrapSequenceContext>
						<Sequence from={0} durationInFrames={1.1}>
							hi
						</Sequence>
					</WrapSequenceContext>,
				),
			).toBe(
				'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex">hi</div>',
			);
		});
		test('It should throw if Sequence has negative duration', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence from={0} durationInFrames={-1}>
								hi
							</Sequence>
						</WrapSequenceContext>,
					),
				/durationInFrames must be positive, but got -1/,
			);
		});
	});

	describe('Throw with invalid from props', () => {
		test('It should throw if "from" props is not a number', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							{/* @ts-expect-error */}
							<Sequence from={'0'} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/You passed to the "from" props of your <Sequence> an argument of type string, but it must be a number./,
			);
		});
	});
	describe('Throw with invalid trimBefore props', () => {
		test('It should throw if "trimBefore" props is not a number', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							{/* @ts-expect-error */}
							<Sequence trimBefore={'0'} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/You passed to the "trimBefore" prop of your <Sequence> an argument of type string, but it must be a number./,
			);
		});

		test('It should throw if "trimBefore" prop is negative', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence trimBefore={-1} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/The "trimBefore" prop of <Sequence \/> must be greater than or equal to 0, but got -1./,
			);
		});

		test('It should throw if "trimBefore" prop is NaN', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence trimBefore={NaN} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/The "trimBefore" prop of <Sequence \/> must be a real number, but it is NaN./,
			);
		});

		test('It should throw if "trimBefore" prop is Infinity', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence trimBefore={Infinity} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/The "trimBefore" prop of <Sequence \/> must be finite, but it is Infinity./,
			);
		});
	});
	describe('Throw with invalid trimAfter and loop props', () => {
		test('trimAfter must be a number greater than trimBefore', () => {
			for (const [trimBefore, trimAfter, expected] of [
				[
					0,
					'30',
					/The "trimAfter" prop of <Sequence \/> must be a number, but is of type string./,
				],
				[
					0,
					NaN,
					/The "trimAfter" prop of <Sequence \/> must be a real number, but it is NaN./,
				],
				[
					10,
					10,
					/The "trimAfter" prop of <Sequence \/> must be greater than "trimBefore" \(10\), but got 10./,
				],
				[
					10,
					9,
					/The "trimAfter" prop of <Sequence \/> must be greater than "trimBefore" \(10\), but got 9./,
				],
			] as const) {
				expectToThrow(
					() =>
						render(
							<WrapSequenceContext>
								<Sequence
									trimBefore={trimBefore}
									trimAfter={trimAfter as number}
								/>
							</WrapSequenceContext>,
						),
					expected,
				);
			}
		});

		test('loop must be boolean and requires a finite trimAfter', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence loop={'true' as unknown as boolean} trimAfter={30} />
						</WrapSequenceContext>,
					),
				/The "loop" prop of <Sequence \/> must be a boolean, but is of type string./,
			);

			for (const trimAfter of [undefined, Infinity]) {
				expectToThrow(
					() =>
						render(
							<WrapSequenceContext>
								<Sequence loop trimAfter={trimAfter} durationInFrames={30} />
							</WrapSequenceContext>,
						),
					/requires a finite "trimAfter" prop/,
				);
			}
		});
	});
	describe('Throw with invalid freeze props', () => {
		test('It should throw if "freeze" prop is not a number', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							{/* @ts-expect-error */}
							<Sequence freeze={'0'} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/The "freeze" prop of <Sequence \/> must be a number, but is of type string./,
			);
		});

		test('It should throw if "freeze" prop is NaN', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence freeze={NaN} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/The "freeze" prop of <Sequence \/> must be a real number, but it is NaN./,
			);
		});

		test('It should throw if "freeze" prop is Infinity', () => {
			expectToThrow(
				() =>
					render(
						<WrapSequenceContext>
							<Sequence freeze={Infinity} durationInFrames={30} />
						</WrapSequenceContext>,
					),
				/The "freeze" prop of <Sequence \/> must be finite, but it is Infinity./,
			);
		});
	});
	describe('Allow valid freeze props', () => {
		test('It should allow "freeze" prop to be null', () => {
			render(
				<WrapSequenceContext>
					<Sequence freeze={null} durationInFrames={30} />
				</WrapSequenceContext>,
			);
		});
	});
	test('It should throw for invalid layout value', () => {
		expectToThrow(
			() =>
				render(
					<WrapSequenceContext>
						<Sequence
							from={0}
							durationInFrames={100}
							// @ts-expect-error
							layout={'invalid-value'}
						/>
					</WrapSequenceContext>,
				),
			/The layout prop of <Sequence \/> expects either "absolute-fill" or "none", but you passed: invalid-value/,
		);
	});
});

describe('Composition-validation render should NOT throw with valid props', () => {
	test('It should allow null as children', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Sequence durationInFrames={100} from={0}>
						{null}
					</Sequence>
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});
	test('It should allow undefined as children', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Sequence durationInFrames={100} from={0}>
						{undefined}
					</Sequence>
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});
	test('It should allow no children', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Sequence durationInFrames={100} from={0} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});
});
