import {cleanup, render} from '@testing-library/react';
import {beforeEach, expect, test} from 'bun:test';
import {Video} from '../video/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

beforeEach(() => {
	cleanup();
});

test('It should render Video without startFrom / endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with startFrom props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" startFrom={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" endAt={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with startFrom and endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" startFrom={10} endAt={15} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Video with trimLeft props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" trimLeft={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with trimRight props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" trimRight={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with trimLeft and trimRight props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" trimLeft={10} trimRight={15} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should throw when both startFrom and trimLeft are provided', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" startFrom={10} trimLeft={5} />
			</WrapSequenceContext>,
		),
	).toThrow(/Cannot use both startFrom and trimLeft props/);
});

test('It should throw when both endAt and trimRight are provided', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Video src="test" endAt={15} trimRight={20} />
			</WrapSequenceContext>,
		),
	).toThrow(/Cannot use both endAt and trimRight props/);
});
