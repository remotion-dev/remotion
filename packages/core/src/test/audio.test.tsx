/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import {describe, expect, test} from 'vitest';
import {Audio} from '../audio/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

describe('Render correctly with props', () => {
	test('It should render Audio without startFrom / endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with startAt  props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} startFrom={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} endAt={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with startFrom and endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} startFrom={10} endAt={20} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with loop, startFrom and endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} startFrom={10} endAt={20} loop />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});
});
