import {cleanup, render} from '@testing-library/react';
import {afterEach, beforeEach, expect, test} from 'bun:test';
import React from 'react';
import {Img} from '../Img.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const ref = React.createRef<HTMLImageElement>();
const testImgUrl = 'https://source.unsplash.com/random/50x50';

beforeEach(() => {
	render(
		<WrapSequenceContext>
			<Img ref={ref} src={testImgUrl} />
		</WrapSequenceContext>,
	);
});

test('Img component renders img tag', () => {
	expect(ref.current?.tagName).toBe('IMG');
});

test('Src attribute is forwarded to img tag', () => {
	expect(ref.current).toHaveProperty('src', testImgUrl);
});
