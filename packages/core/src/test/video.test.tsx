/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import {describe, expect, test} from 'vitest';
import {Video} from '../video/index.js';
import {expectToThrow} from './expect-to-throw.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

describe('Render correctly with props', () => {
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
	test('It should throw if videoConfig/Wrapper is missing', () => {
		expectToThrow(
			() => render(<Video startFrom={10} endAt={15} />),
			/No video config found/,
		);
	});
});
