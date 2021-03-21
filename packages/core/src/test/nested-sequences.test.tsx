import {render} from '@testing-library/react';
import React from 'react';
import {Sequence} from '../sequencing';
import {TimelineContext} from '../timeline-position-state';
import {useCurrentFrame} from '../use-frame';

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
		<TimelineContext.Provider
			value={{
				frame: 40,
				playing: false,
				shouldRegisterSequences: true,
			}}
		>
			<Sequence from={20} durationInFrames={100}>
				<Child />
			</Sequence>
		</TimelineContext.Provider>
	);
	expect(queryByText(/^frame9$/i)).not.toBe(null);
});
