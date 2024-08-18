/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import {describe, expect, test} from 'vitest';
import {AnimatedImage} from '../animate-image';

describe('Render correctly with props', () => {
	test('should render with default props', () => {
		expect(() =>
			render(
				<AnimatedImage src="https://gist.github.com/nolanlawson/73f15f3fe612b8770e79/raw/be4205effd089b38ccd197de544e6370785f6b5e/chopsticks.gif" />,
			),
		).not.toThrow();
	});
});
