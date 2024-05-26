/**
 * @vitest-environment jsdom
 */

import {render} from '@testing-library/react';
import React from 'react';
import {describe, expect, test} from 'vitest';
import {Sequence} from '../Sequence.js';
import {Freeze} from '../freeze.js';
import {useVideoConfig} from '../use-video-config.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const Inner: React.FC = () => {
	const config = useVideoConfig();

	return <div>{config.durationInFrames}</div>;
};

describe('Composition-validation render should NOT throw with valid props', () => {
	test('It should allow undefined as children', () => {
		const {queryByText} = render(
			<WrapSequenceContext>
				<Freeze frame={10000}>
					<Sequence durationInFrames={2424} from={9265}>
						<Inner />
					</Sequence>
				</Freeze>
			</WrapSequenceContext>,
		);

		expect(queryByText(/^2424$/)).not.toBe(null);
	});
});
