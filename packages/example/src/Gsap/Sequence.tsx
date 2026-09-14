import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {OpacityFixture} from './OpacityFixture';

const SequenceFixture: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Sequence from={30} durationInFrames={45} premountFor={10}>
			<OpacityFixture />
		</Sequence>
	</AbsoluteFill>
);

export default SequenceFixture;
