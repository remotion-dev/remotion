/**
 * @vitest-environment jsdom
 */
/* eslint-disable react/jsx-no-constructed-context-values */
import {render} from '@testing-library/react';
import React from 'react';
import {expect, test} from 'vitest';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import {Series} from '../series';
import {TimelineContext} from '../timeline-position-state';
import {useCurrentFrame} from '../use-current-frame';

const First = () => {
	const frame = useCurrentFrame();
	return <div>{'first ' + frame}</div>;
};

const Second = () => {
	const frame = useCurrentFrame();
	return <div>{'second ' + frame}</div>;
};

const Third = () => {
	const frame = useCurrentFrame();
	return <div>{'third ' + frame}</div>;
};

const renderForFrame = (frame: number, markup: React.ReactNode) => {
	return render(
		<CanUseRemotionHooksProvider>
			<TimelineContext.Provider
				value={{
					rootId: '',
					frame,
					playing: false,
					imperativePlaying: {
						current: false,
					},
					playbackRate: 1,
					setPlaybackRate: () => {
						throw new Error('playback rate');
					},
					audioAndVideoTags: {current: []},
				}}
			>
				{markup}
			</TimelineContext.Provider>
		</CanUseRemotionHooksProvider>
	);
};

test('Basic series test', () => {
	const {queryByText} = renderForFrame(
		10,
		<Series>
			<Series.Sequence durationInFrames={5}>
				<First />
			</Series.Sequence>
			<Series.Sequence durationInFrames={5}>
				<Second />
			</Series.Sequence>
			<Series.Sequence durationInFrames={5}>
				<Third />
			</Series.Sequence>
		</Series>
	);
	expect(queryByText(/^third\s0$/)).not.toBe(null);
});

test('Should support fragments', () => {
	const {container} = renderForFrame(
		10,
		<Series>
			<Series.Sequence durationInFrames={5}>
				<First />
			</Series.Sequence>
			<>
				<Series.Sequence key="0" durationInFrames={5}>
					<Second />
				</Series.Sequence>
				<Series.Sequence key="1" durationInFrames={5}>
					<Third />
				</Series.Sequence>
			</>
		</Series>
	);

	expect(container.outerHTML).not.toBe(null);
});
test('Should not allow foreign elements', () => {
	expect(() => {
		render(
			<Series>
				<First />
			</Series>
		);
	}).toThrow(/only accepts a/);
});
test('Should allow layout prop', () => {
	const {container} = renderForFrame(
		0,
		<Series>
			<Series.Sequence durationInFrames={1}>
				<First />
			</Series.Sequence>
		</Series>
	);
	expect(container.outerHTML).toBe(
		'<div><div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; width: 100%; height: 100%; display: flex;"><div>first 0</div></div></div>'
	);

	const {container: withoutLayoutContainer} = renderForFrame(
		0,
		<Series>
			<Series.Sequence durationInFrames={1} layout="none">
				<First />
			</Series.Sequence>
		</Series>
	);
	expect(withoutLayoutContainer.outerHTML).toBe(
		'<div><div>first 0</div></div>'
	);
});
test('Should render nothing after the end', () => {
	const {container} = renderForFrame(
		10,
		<Series>
			<Series.Sequence durationInFrames={1}>
				<First />
			</Series.Sequence>
		</Series>
	);
	expect(container.outerHTML).toBe('<div></div>');
});
test('Should throw if invalid or no duration provided', () => {
	expect(() => {
		renderForFrame(
			10,
			<Series>
				<Series.Sequence durationInFrames={NaN}>
					<First />
				</Series.Sequence>
			</Series>
		);
	}).toThrow(
		/The "durationInFrames" prop of a <Series.Sequence \/> component must be an integer, but got NaN./
	);
	expect(() => {
		renderForFrame(
			10,
			<Series>
				{/**
				 * @ts-expect-error */}
				<Series.Sequence>
					<First />
				</Series.Sequence>
			</Series>
		);
	}).toThrow(
		/The "durationInFrames" prop of a <Series.Sequence \/> component must be a number, but you passed a value of type undefined/
	);
});
test('Should allow whitespace', () => {
	const {queryByText} = renderForFrame(
		11,
		<Series>
			<Series.Sequence durationInFrames={10}>
				<First />
			</Series.Sequence>{' '}
			<Series.Sequence durationInFrames={10}>
				<Second />
			</Series.Sequence>
		</Series>
	);
	expect(queryByText(/^second\s1$/g)).not.toBe(null);
});
test('Handle empty Series.Sequence', () => {
	expect(() =>
		renderForFrame(
			11,
			<Series>
				<Series.Sequence durationInFrames={10}>
					<First />
				</Series.Sequence>
				<Series.Sequence durationInFrames={10} />
			</Series>
		)
	).toThrow(
		/A <Series.Sequence \/> component \(index = 1, duration = 10\) was detected to not have any children\. Delete it to fix this error\./
	);
});

test('Should allow negative overlap prop', () => {
	const {container} = renderForFrame(
		4,
		<Series>
			<Series.Sequence durationInFrames={5} layout="none">
				<First />
			</Series.Sequence>
			<Series.Sequence offset={-1} layout="none" durationInFrames={5}>
				<Second />
			</Series.Sequence>
		</Series>
	);
	expect(container.outerHTML).toBe(
		'<div><div>first 4</div><div>second 0</div></div>'
	);
});

test('Should allow positive overlap prop', () => {
	const {container} = renderForFrame(
		5,
		<Series>
			<Series.Sequence durationInFrames={5} layout="none">
				<First />
			</Series.Sequence>
			<Series.Sequence offset={1} layout="none" durationInFrames={5}>
				<Second />
			</Series.Sequence>
		</Series>
	);
	expect(container.outerHTML).toBe('<div></div>');
});

test('Should disallow NaN as offset prop', () => {
	expect(() => {
		renderForFrame(
			9,
			<Series>
				<Series.Sequence offset={NaN} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>
		);
	}).toThrow(
		/The "offset" property of a <Series.Sequence \/> must not be NaN, but got NaN \(index = 0, duration = 5\)\./
	);
});

test('Should disallow Infinity as offset prop', () => {
	expect(() => {
		renderForFrame(
			9,
			<Series>
				<Series.Sequence offset={Infinity} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>
		);
	}).toThrow(
		/The "offset" property of a <Series.Sequence \/> must be finite, but got Infinity \(index = 0, duration = 5\)\./
	);
});

test('Should disallow non-integer numbers as offset prop', () => {
	expect(() => {
		renderForFrame(
			9,
			<Series>
				<Series.Sequence offset={Math.PI} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>
		);
	}).toThrow(
		/The "offset" property of a <Series.Sequence \/> must be finite, but got 3.141592653589793 \(index = 0, duration = 5\)\./
	);
});

test('Should cascade negative offset props', () => {
	const {container} = renderForFrame(
		9,
		<Series>
			<Series.Sequence durationInFrames={5} layout="none">
				<First />
			</Series.Sequence>
			<Series.Sequence offset={-1} layout="none" durationInFrames={5}>
				<Second />
			</Series.Sequence>
			<Series.Sequence layout="none" durationInFrames={5}>
				<Third />
			</Series.Sequence>
		</Series>
	);
	expect(container.outerHTML).toBe('<div><div>third 0</div></div>');
});

test('Should cascade positive offset props', () => {
	const {container} = renderForFrame(
		11,
		<Series>
			<Series.Sequence durationInFrames={5} layout="none">
				<First />
			</Series.Sequence>
			<Series.Sequence offset={1} layout="none" durationInFrames={5}>
				<Second />
			</Series.Sequence>
			<Series.Sequence layout="none" durationInFrames={5}>
				<Third />
			</Series.Sequence>
		</Series>
	);
	expect(container.outerHTML).toBe('<div><div>third 0</div></div>');
});
