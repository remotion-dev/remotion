import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import type {ReactNode} from 'react';
import {Internals} from '../internals.js';
import {Sequence} from '../Sequence.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const NonRenderingEnvironment = ({
	children,
}: {
	readonly children: ReactNode;
}) => {
	return (
		<Internals.RemotionEnvironmentContext
			value={{
				isRendering: false,
				isClientSideRendering: false,
				isPlayer: true,
				isStudio: false,
				isReadOnlyStudio: false,
			}}
		>
			{children}
		</Internals.RemotionEnvironmentContext>
	);
};

test('preserves the Sequence opacity while it is active', () => {
	const {container} = render(
		<WrapSequenceContext currentFrame={10}>
			<NonRenderingEnvironment>
				<Sequence
					from={10}
					durationInFrames={20}
					premountFor={10}
					style={{opacity: 0.5}}
				>
					Content
				</Sequence>
			</NonRenderingEnvironment>
		</WrapSequenceContext>,
	);

	expect(container.firstElementChild?.getAttribute('style')).toContain(
		'opacity: 0.5',
	);
});

test('hides a Sequence while it is premounted', () => {
	const {container} = render(
		<WrapSequenceContext currentFrame={0}>
			<NonRenderingEnvironment>
				<Sequence
					from={10}
					durationInFrames={20}
					premountFor={10}
					style={{opacity: 0.5}}
				>
					Content
				</Sequence>
			</NonRenderingEnvironment>
		</WrapSequenceContext>,
	);

	expect(container.firstElementChild?.getAttribute('style')).toContain(
		'opacity: 0',
	);
});
