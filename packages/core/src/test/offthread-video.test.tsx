import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, test} from 'bun:test';
import {OffthreadVideo} from '../video/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

describe('OffthreadVideo render correctly with props', () => {
	test('It should render OffthreadVideo without startFrom / endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with startFrom props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" startFrom={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" endAt={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with startFrom and endAt props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" startFrom={10} endAt={20} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with trimLeft props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" trimLeft={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with trimRight props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" trimRight={10} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should render OffthreadVideo with trimLeft and trimRight props', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" trimLeft={10} trimRight={20} />
				</WrapSequenceContext>,
			),
		).not.toThrow();
	});

	test('It should throw when both startFrom and trimLeft are provided', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" startFrom={10} trimLeft={5} />
				</WrapSequenceContext>,
			),
		).toThrow(/Cannot use both startFrom and trimLeft props/);
	});

	test('It should throw when both endAt and trimRight are provided', () => {
		expect(() =>
			render(
				<WrapSequenceContext>
					<OffthreadVideo src="test" endAt={15} trimRight={20} />
				</WrapSequenceContext>,
			),
		).toThrow(/Cannot use both endAt and trimRight props/);
	});
});