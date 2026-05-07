import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {createRef} from 'react';
import {Html5Audio} from '../audio/index.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

test('It should render Audio without startFrom / endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with startAt  props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimBefore={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimAfter={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with startFrom and endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimBefore={10} trimAfter={20} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with loop, startFrom and endAt props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimBefore={10} trimAfter={20} loop />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with trimBefore props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimBefore={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with trimAfter props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimAfter={10} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with trimBefore and trimAfter props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimBefore={10} trimAfter={20} />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should render Audio with loop, trimBefore and trimAfter props', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} trimBefore={10} trimAfter={20} loop />
			</WrapSequenceContext>,
		),
	).not.toThrow();
});

test('It should throw when both startFrom and trimBefore are provided', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} startFrom={10} trimBefore={5} />
			</WrapSequenceContext>,
		),
	).toThrow(/Cannot use both startFrom and trimBefore props/);
});

test('It should throw when both endAt and trimAfter are provided', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio src="test" volume={1} endAt={15} trimAfter={20} />
			</WrapSequenceContext>,
		),
	).toThrow(/Cannot use both endAt and trimAfter props/);
});

test('It should not set preservesPitch if the prop is omitted from Audio', () => {
	let audio: HTMLAudioElement | null = null;

	render(
		<WrapSequenceContext>
			<Html5Audio
				ref={(element) => {
					if (element) {
						element.preservesPitch = false;
						audio = element;
					}
				}}
				src="test"
				volume={1}
			/>
		</WrapSequenceContext>,
	);

	expect((audio as HTMLAudioElement | null)?.preservesPitch).toBe(false);
});

test('It should sync preservesPitch on Audio', () => {
	const ref = createRef<HTMLAudioElement>();
	const {rerender} = render(
		<WrapSequenceContext>
			<Html5Audio ref={ref} preservesPitch src="test" volume={1} />
		</WrapSequenceContext>,
	);

	expect(ref.current?.preservesPitch).toBe(true);

	rerender(
		<WrapSequenceContext>
			<Html5Audio ref={ref} preservesPitch={false} src="test" volume={1} />
		</WrapSequenceContext>,
	);

	expect(ref.current?.preservesPitch).toBe(false);
});

test('It should reject invalid preservesPitch values on Audio', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Html5Audio
					// @ts-expect-error
					preservesPitch="yes"
					src="test"
					volume={1}
				/>
			</WrapSequenceContext>,
		),
	).toThrow(
		/'preservesPitch' must be a boolean or undefined but got 'string' instead/,
	);
});
