import {render} from '@testing-library/react';
import React from 'react';
import {Img} from '../Img';

describe('Img test', () => {
	const ref = React.createRef<HTMLImageElement>();
	const testImgUrl = 'https://source.unsplash.com/random/50x50';

	beforeEach(() => {
		render(<Img ref={ref} src={testImgUrl} />);
	});

	test('renders img tag', () => {
		expect(ref.current?.tagName).toBe('IMG');
	});

	test('forwards src', () => {
		expect(ref.current).toHaveProperty('src', testImgUrl);
	});
});
