import {cleanup, render} from '@testing-library/react';
import {afterEach, expect, test} from 'bun:test';
import {AbsoluteFill} from '../AbsoluteFill.js';
import {Sequence} from '../Sequence.js';
import {TimelineContext} from '../timeline-position-state.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

const getForFrame = (frame: number, content: React.ReactNode) => {
	const {queryByText} = render(
		<WrapSequenceContext>
			<TimelineContext.Provider
				value={{
					frame: {
						'my-comp': frame,
					},
					playing: false,
					rootId: 'hi',
					imperativePlaying: {
						current: false,
					},
					playbackRate: 1,
					setPlaybackRate: () => {
						throw new Error('playback rate');
					},
					audioAndVideoTags: {
						current: [],
					},
				}}
			>
				{content}
			</TimelineContext.Provider>
		</WrapSequenceContext>,
	);
	return queryByText;
};

test('It should calculate the correct offset in nested sequences', () => {
	const NestedChild = () => {
		const frame = useCurrentFrame();
		return <div>{'frame' + frame}</div>;
	};

	const Child2 = () => {
		return (
			<Sequence from={1} durationInFrames={50}>
				<NestedChild />
			</Sequence>
		);
	};

	const Child = () => {
		return (
			<Sequence from={10} durationInFrames={50}>
				<Child2 />
			</Sequence>
		);
	};

	const content = (
		<Sequence from={20} durationInFrames={100}>
			<Child />
		</Sequence>
	);
	const result = getForFrame(40, content);

	expect(result(/^frame9$/i)).not.toBe(null);
});

test('Negative offset test', () => {
	const NestedChild = () => {
		const frame = useCurrentFrame();
		return <div>{'frame' + frame}</div>;
	};

	const content = (
		<Sequence from={-200} durationInFrames={300}>
			<Sequence from={10} durationInFrames={300}>
				<Sequence from={10} durationInFrames={300}>
					<NestedChild />
				</Sequence>
			</Sequence>
		</Sequence>
	);

	const result = getForFrame(40, content);
	expect(result(/^frame220/i)).not.toBe(null);
});

test('Nested negative offset test', () => {
	const NestedChild = () => {
		const frame = useCurrentFrame();
		return <div>{'frame' + frame}</div>;
	};

	const startFrom = 40;
	const endAt = 90;

	const content = (
		<Sequence from={0 - startFrom} durationInFrames={endAt}>
			<NestedChild />
		</Sequence>
	);

	const frame0 = getForFrame(0, content);
	expect(frame0(/^frame40$/i)).not.toBe(null);
	const frame39 = getForFrame(39, content);
	expect(frame39(/^frame79$/i)).not.toBe(null);
	const frame50 = getForFrame(50, content);
	expect(frame50(/^frame90$/i)).toBe(null);
});

test('Negative offset edge case', () => {
	const NestedChild = () => {
		const frame = useCurrentFrame();
		return <div>{'frame' + frame}</div>;
	};

	const startFrom = 40;
	const endAt = 90;

	const content = (
		<Sequence from={40}>
			<Sequence from={0 - startFrom} durationInFrames={endAt}>
				<NestedChild />
			</Sequence>
		</Sequence>
	);

	expect(getForFrame(40, content)(/^frame40$/i)).not.toBe(null);
	expect(getForFrame(0, content)(/^frame0/i)).toBe(null);
	expect(getForFrame(10, content)(/^frame10/i)).toBe(null);
	const atFrame80 = getForFrame(80, content)(/^frame80$/i);
	expect(atFrame80).not.toBe(null);
	const atFrame90 = getForFrame(90, content)(/^frame90$/i);
	expect(atFrame90).toBe(null);
});

test('Floats', () => {
	const content = (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Sequence from={5.1000000000000005} durationInFrames={128.4}>
				<h1>One</h1>
			</Sequence>
			<Sequence from={133.5} durationInFrames={96.72}>
				<h1>Two</h1>
			</Sequence>
		</AbsoluteFill>
	);
	expect(getForFrame(132, content)(/^One$/i)).not.toBe(null);
	cleanup();
	expect(getForFrame(133, content)(/^One$/i)).not.toBe(null);
	cleanup();
	expect(getForFrame(133, content)(/^Two$/i)).toBe(null);
	cleanup();
	expect(getForFrame(134, content)(/^Two$/i)).not.toBe(null);
});
