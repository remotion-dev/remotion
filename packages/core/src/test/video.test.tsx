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
