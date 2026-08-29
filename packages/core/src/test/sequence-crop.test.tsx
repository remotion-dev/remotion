import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {Interactive} from '../Interactive.js';
import {resolveSequenceCrop} from '../sequence-crop.js';
import {Sequence} from '../Sequence.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

test('applies Sequence crop values as an inset clip path', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Sequence cropLeft={0.1} cropRight={0.2} cropTop={0.3} cropBottom={0.4}>
				Content
			</Sequence>
		</WrapSequenceContext>,
	);

	const sequence = container.firstElementChild as HTMLDivElement;
	expect(sequence.style.clipPath).toBe('inset(30% 20% 40% 10%)');
});

test('preserves a numeric border radius on the cropped rectangle', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Sequence cropLeft={0.1} style={{borderRadius: 24}}>
				Content
			</Sequence>
		</WrapSequenceContext>,
	);

	const sequence = container.firstElementChild as HTMLDivElement;
	expect(sequence.style.clipPath).toBe('inset(0% 0% 0% 10% round 24px)');
});

test('preserves a string border radius on the cropped rectangle', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Sequence cropTop={0.2} style={{borderRadius: '20% / 10%'}}>
				Content
			</Sequence>
		</WrapSequenceContext>,
	);

	const sequence = container.firstElementChild as HTMLDivElement;
	expect(sequence.style.clipPath).toBe('inset(20% 0% 0% 0% round 20% / 10%)');
});

test('preserves individual border radii on the cropped rectangle', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Sequence
				cropRight={0.2}
				style={{
					borderTopLeftRadius: 8,
					borderTopRightRadius: 16,
					borderBottomRightRadius: 24,
					borderBottomLeftRadius: 32,
				}}
			>
				Content
			</Sequence>
		</WrapSequenceContext>,
	);

	const sequence = container.firstElementChild as HTMLDivElement;
	expect(sequence.style.clipPath).toBe(
		'inset(0% 20% 0% 0% round 8px 16px 24px 32px)',
	);
});

test('does not override a custom clip path when no crop is applied', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Sequence style={{clipPath: 'circle(50%)'}}>Content</Sequence>
		</WrapSequenceContext>,
	);

	const sequence = container.firstElementChild as HTMLDivElement;
	expect(sequence.style.clipPath).toBe('circle(50%)');
});

test('clashing crops meet in the middle', () => {
	expect(
		resolveSequenceCrop({
			cropLeft: 0.6,
			cropRight: 0.6,
			cropTop: 0.8,
			cropBottom: 0.4,
		}),
	).toEqual({left: 0.5, right: 0.5, top: 0.5, bottom: 0.5});
});

test('clamps crop values outside the 0 to 1 range', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Interactive.Div cropLeft={-0.1} cropRight={1.1}>
				Content
			</Interactive.Div>
		</WrapSequenceContext>,
	);

	const element = container.firstElementChild as HTMLDivElement;
	expect(element.style.clipPath).toBe('inset(0% 100% 0% 0%)');
});

test('rejects crop values above 100 with a range hint', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Interactive.Div cropLeft={101}>Content</Interactive.Div>
			</WrapSequenceContext>,
		),
	).toThrow(
		'The "cropLeft" prop of <Interactive.Div> must be between 0 and 1, but got 101. The crop range is 0 to 1, not 0 to 100.',
	);
});

test('rejects crop props in layout none mode', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Sequence layout="none" cropLeft={0.1}>
					Content
				</Sequence>
			</WrapSequenceContext>,
		),
	).toThrow(
		'The cropLeft, cropRight, cropTop and cropBottom props of <Sequence /> are only supported with layout="absolute-fill".',
	);
});
