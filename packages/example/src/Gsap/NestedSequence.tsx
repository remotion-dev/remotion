import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {OpacityFixture} from './OpacityFixture';

const NestedSequenceFixture: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Sequence from={20} durationInFrames={60}>
			<Sequence from={10} durationInFrames={45}>
				<OpacityFixture />
			</Sequence>
		</Sequence>
	</AbsoluteFill>
);

export default NestedSequenceFixture;
