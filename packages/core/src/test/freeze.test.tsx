/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import React from 'react';
import {describe, expect, test} from 'vitest';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import {Freeze} from '../freeze';
import {Sequence} from '../index';
import type {TimelineContextValue} from '../timeline-position-state';
import {TimelineContext} from '../timeline-position-state';
import {useCurrentFrame} from '../use-current-frame';
import {expectToThrow} from './expect-to-throw';

describe('Prop validation', () => {
	test('It should throw if Freeze has string as frame prop value', () => {
		expectToThrow(
			// @ts-expect-error
			() => render(<Freeze frame={'0'} />),
			/The 'frame' prop of <Freeze \/> must be a number, but is of type string/
		);
	});
	test('It should throw if Freeze has undefined as frame prop value', () => {
		expectToThrow(
			// @ts-expect-error
			() => render(<Freeze />),
			/The <Freeze \/> component requires a 'frame' prop, but none was passed./
		);
	});
});

const timelineCtxValue = (frame: number): TimelineContextValue => ({
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
});

const renderForFrame = (frame: number, markup: React.ReactNode) => {
	return render(
		<CanUseRemotionHooksProvider>
			<TimelineContext.Provider value={timelineCtxValue(frame)}>
				{markup}
			</TimelineContext.Provider>
		</CanUseRemotionHooksProvider>
	);
};

const Basic: React.FC = () => {
	return (
		<Freeze frame={300}>
			<TestComponent />
		</Freeze>
	);
};

const WithSequence: React.FC = () => {
	const SequenceFrom = 200;
	const FreezeFrame = 100;
	return (
		<Sequence from={SequenceFrom} layout="none">
			<Freeze frame={FreezeFrame}>
				<TestComponent />
			</Freeze>
		</Sequence>
	);
};

const TestComponent: React.FC = () => {
	const frame = useCurrentFrame();
	return <div>{frame}</div>;
};

describe('Integration tests', () => {
	test('Basic test', () => {
		const {container} = renderForFrame(0, <Basic />);
		expect(container.innerHTML).toBe('<div>300</div>');
	});

	test('Should ignore a Sequence', () => {
		const {container} = renderForFrame(300, <WithSequence />);
		expect(container.innerHTML).toBe('<div>100</div>');
	});
});
