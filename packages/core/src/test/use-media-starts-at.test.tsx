import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {useFrameForVolumeProp} from '../audio/use-audio-frame.js';
import {Sequence} from '../Sequence.js';
import {TimelineContext} from '../TimelineContext.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

const Probe: React.FC<{readonly label: string}> = ({label}) => {
	const frameForVolumeProp = useFrameForVolumeProp('repeat');
	return <div data-testid={label}>{frameForVolumeProp}</div>;
};

const renderAtFrame = (frame: number, content: React.ReactNode) => {
	return render(
		<WrapSequenceContext>
			<TimelineContext.Provider
				value={{
					frame: {
						'my-comp': frame,
					},
					playing: false,
					rootId: 'test-root',
					imperativePlaying: {
						current: false,
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
};

test('Calculates identical volume frame for wrapped and unwrapped media in negative sequence', () => {
	const {getByTestId} = renderAtFrame(
		0,
		<Sequence from={-30} durationInFrames={120}>
			<Probe label="direct" />
			<Sequence from={0} durationInFrames={120}>
				<Probe label="wrapped" />
			</Sequence>
		</Sequence>,
	);

	expect(getByTestId('direct').textContent).toBe('0');
	expect(getByTestId('wrapped').textContent).toBe('0');
});

test('Uses combined nested offsets to match first renderable volume frame', () => {
	const {getByTestId} = renderAtFrame(
		0,
		<Sequence from={-50} durationInFrames={120}>
			<Sequence from={20} durationInFrames={120}>
				<Sequence from={0} durationInFrames={120}>
					<Probe label="nested" />
				</Sequence>
			</Sequence>
		</Sequence>,
	);

	expect(getByTestId('nested').textContent).toBe('0');
});

test('Keeps positive parent offsets when computing the volume frame', () => {
	const content = (
		<Sequence from={50} durationInFrames={120}>
			<Sequence from={-20} durationInFrames={120}>
				<Sequence from={0} durationInFrames={120}>
					<Probe label="positive-parent" />
				</Sequence>
			</Sequence>
		</Sequence>
	);

	expect(renderAtFrame(0, content).queryByTestId('positive-parent')).toBe(null);
	cleanup();
	expect(renderAtFrame(49, content).queryByTestId('positive-parent')).toBe(
		null,
	);
	cleanup();
	expect(
		renderAtFrame(50, content).getByTestId('positive-parent').textContent,
	).toBe('20');
});
