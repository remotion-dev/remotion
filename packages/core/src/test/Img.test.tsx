/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import React from 'react';
import {beforeEach, expect, test} from 'vitest';
import {Img} from '../Img.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

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
