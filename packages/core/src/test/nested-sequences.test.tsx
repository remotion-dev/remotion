/* eslint-disable react/jsx-no-constructed-context-values */
import {render} from '@testing-library/react';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import {Sequence} from '../Sequence';
import {TimelineContext} from '../timeline-position-state';
import {useCurrentFrame} from '../use-current-frame';

test('It should calculate the correct offset in nested sequences', () => {
	const NestedChild = () => {
		const frame = useCurrentFrame();
		return <div>{'frame' + frame}</div>;
	};

	const Child = () => {
		return (
			<Sequence from={10} durationInFrames={50}>
				<Child2 />
			</Sequence>
		);
	};

	const Child2 = () => {
		return (
			<Sequence from={1} durationInFrames={50}>
				<NestedChild />
			</Sequence>
		);
	};

	const {queryByText} = render(
		<CanUseRemotionHooksProvider>
			<TimelineContext.Provider
				value={{
					rootId: 'hi',
					frame: 40,
					playing: false,
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
				<Sequence from={20} durationInFrames={100}>
					<Child />
				</Sequence>
			</TimelineContext.Provider>
		</CanUseRemotionHooksProvider>
	);
	expect(queryByText(/^frame9$/i)).not.toBe(null);
});

test('Negative offset test', () => {
	const NestedChild = () => {
		const frame = useCurrentFrame();
		return <div>{'frame' + frame}</div>;
	};

	const {queryByText} = render(
		<CanUseRemotionHooksProvider>
			<TimelineContext.Provider
				value={{
					frame: 40,
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
				<Sequence from={-200} durationInFrames={300}>
					<Sequence from={10} durationInFrames={300}>
						<Sequence from={10} durationInFrames={300}>
							<NestedChild />
						</Sequence>
					</Sequence>
				</Sequence>
			</TimelineContext.Provider>
		</CanUseRemotionHooksProvider>
	);
	const result = queryByText(/^frame220/i);
	expect(result).not.toBe(null);
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

	const getForFrame = (frame: number) => {
		const {queryByText} = render(
			<CanUseRemotionHooksProvider>
				<TimelineContext.Provider
					value={{
						frame,
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
			</CanUseRemotionHooksProvider>
		);
		return queryByText;
	};

	const frame0 = getForFrame(0);
	expect(frame0(/^frame40$/i)).not.toBe(null);
	const frame39 = getForFrame(39);
	expect(frame39(/^frame79$/i)).not.toBe(null);
	const frame50 = getForFrame(50);
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

	const getForFrame = (frame: number) => {
		const {queryByText} = render(
			<CanUseRemotionHooksProvider>
				<TimelineContext.Provider
					value={{
						frame,
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
			</CanUseRemotionHooksProvider>
		);
		return queryByText;
	};

	expect(getForFrame(0)(/^frame/i)).toBe(null);
	expect(getForFrame(10)(/^frame/i)).toBe(null);
	expect(getForFrame(40)(/^frame40$/i)).not.toBe(null);
	const atFrame80 = getForFrame(80)(/^frame80$/i);
	expect(atFrame80).not.toBe(null);
	const atFrame90 = getForFrame(90)(/^frame90$/i);
	expect(atFrame90).toBe(null);
});
