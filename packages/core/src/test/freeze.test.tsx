import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, test} from 'bun:test';
import {Freeze} from '../freeze.js';
import {expectToThrow} from './expect-to-throw.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

describe('Prop validation', () => {
	test('It should throw if Freeze has string as frame prop value', () => {
		expectToThrow(
			() =>
				render(
					<WrapSequenceContext>
						{/**
							// @ts-expect-error */}
						<Freeze frame={'0'} />
					</WrapSequenceContext>,
				),
			/The 'frame' prop of <Freeze \/> must be a number, but is of type string/,
		);
	});
	test('It should throw if Freeze has undefined as frame prop value', () => {
		expectToThrow(
			() =>
				render(
					<WrapSequenceContext>
						{/**
							// @ts-expect-error */}
						<Freeze />
					</WrapSequenceContext>,
				),
			/The <Freeze \/> component requires a 'frame' prop, but none was passed./,
		);
	});
});
