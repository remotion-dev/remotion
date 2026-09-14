import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {OpacityFixture} from './OpacityFixture';

const NestedSequenceFixture: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Sequence from={20} durationInFrames={60} premountFor={10}>
			<Sequence from={10} durationInFrames={45} premountFor={5}>
				<OpacityFixture />
			</Sequence>
		</Sequence>
	</AbsoluteFill>
);

export default NestedSequenceFixture;
