import {render} from '@testing-library/react';
import React from 'react';
import {Sequence} from '../sequencing';
import {expectToThrow} from './expect-to-throw';

test('It should throw if Sequence has missing duration', () => {
	expectToThrow(
		// @ts-expect-error
		() => render(<Sequence from={0} />),
		/You passed to durationInFrames an argument of type undefined, but it must be a number./
	);
});

test('It should allow null as children', () => {
	expect(() =>
		render(
			<Sequence durationInFrames={100} from={0}>
				{null}
			</Sequence>
		)
	).not.toThrow();
});

test('It should allow undefined as children', () => {
	expect(() =>
		render(
			<Sequence durationInFrames={100} from={0}>
				{undefined}
			</Sequence>
		)
	).not.toThrow();
});
