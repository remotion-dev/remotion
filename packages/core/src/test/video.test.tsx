import {beforeEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {createRef} from 'react';
import {Html5Video} from '../video/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

beforeEach(() => {
	cleanup();
});

test('It should render Video without startFrom / endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with startFrom props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" startFrom={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" endAt={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with startFrom and endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" startFrom={10} endAt={15} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Video with trimBefore props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" trimBefore={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with trimAfter props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" trimAfter={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});
test('It should render Video with trimBefore and trimAfter props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" trimBefore={10} trimAfter={15} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should throw when both startFrom and trimBefore are provided', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" startFrom={10} trimBefore={5} />
			</WrapSequenceContext>,
		),
	).toThrow(/Cannot use both startFrom and trimBefore props/);
});

test('It should throw when both endAt and trimAfter are provided', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video src="test" endAt={15} trimAfter={20} />
			</WrapSequenceContext>,
		),
	).toThrow(/Cannot use both endAt and trimAfter props/);
});

test('It should not set preservesPitch if the prop is omitted from Video', () => {
	let video: HTMLVideoElement | null = null;

	render(
		<WrapSequenceContext>
			<Html5Video
				ref={(element) => {
					if (element) {
						element.preservesPitch = false;
						video = element;
					}
				}}
				src="test"
			/>
		</WrapSequenceContext>,
	);

	expect((video as HTMLVideoElement | null)?.preservesPitch).toBe(false);
});

test('It should sync preservesPitch on Video', () => {
	const ref = createRef<HTMLVideoElement>();
	const {rerender} = render(
		<WrapSequenceContext>
			<Html5Video ref={ref} preservesPitch src="test" />
		</WrapSequenceContext>,
	);

	expect(ref.current?.preservesPitch).toBe(true);

	rerender(
		<WrapSequenceContext>
			<Html5Video ref={ref} preservesPitch={false} src="test" />
		</WrapSequenceContext>,
	);

	expect(ref.current?.preservesPitch).toBe(false);
});

test('It should reject invalid preservesPitch values on Video', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Video
					// @ts-expect-error
					preservesPitch="yes"
					src="test"
				/>
			</WrapSequenceContext>,
		),
	).toThrow(
		/'preservesPitch' must be a boolean or undefined but got 'string' instead/,
	);
});
