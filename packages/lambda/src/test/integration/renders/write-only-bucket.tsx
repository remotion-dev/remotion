/* eslint-disable no-restricted-imports -- Browser entry bundled for the Lambda integration test. */
import React from 'react';
import {AbsoluteFill, Composition, getInputProps, registerRoot} from 'remotion';

const Video: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: getInputProps().color as string}} />
);

registerRoot(() => (
	<Composition
		id="write-only"
		component={Video}
		width={32}
		height={32}
		fps={30}
		durationInFrames={4}
	/>
));
