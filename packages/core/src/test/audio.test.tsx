import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, test} from 'bun:test';
import {Audio} from '../audio/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

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

	test('It should render Audio with trimLeft props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} trimLeft={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with trimRight props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} trimRight={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with trimLeft and trimRight props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} trimLeft={10} trimRight={20} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render Audio with loop, trimLeft and trimRight props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} trimLeft={10} trimRight={20} loop />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should throw when both startFrom and trimLeft are provided', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} startFrom={10} trimLeft={5} />
				</WrapSequenceContext>,
			),
		).toThrow(/Cannot use both startFrom and trimLeft props/);
	});

	test('It should throw when both endAt and trimRight are provided', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Audio src="test" volume={1} endAt={15} trimRight={20} />
				</WrapSequenceContext>,
			),
		).toThrow(/Cannot use both endAt and trimRight props/);
	});
});
