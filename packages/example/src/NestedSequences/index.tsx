import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';

const NestedSequences: React.FC = () => {
	return (
		<Sequence from={20} durationInFrames={40}>
			<NestedTwo />
		</Sequence>
	);
};

const NestedTwo = () => {
	return (
		<Sequence from={20.5} durationInFrames={60}>
			<Child />
		</Sequence>
	);
};

const Child = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				backgroundColor: 'white',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				fontSize: 50,
			}}
		>
			{frame}
		</div>
	);
};

export default NestedSequences;
