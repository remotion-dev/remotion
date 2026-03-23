// This is a separate component file for testing if refreshing a subtree keeps the nonce order.
// Edit this file while the studio is running to trigger a fast refresh of just this subtree.
import {LightLeak} from '@remotion/light-leaks';
import React from 'react';
import {Sequence} from 'remotion';

export const FastUpdatesSubtree: React.FC = () => {
	return (
		<>
			<Sequence durationInFrames={60}>hithere</Sequence>
			<LightLeak durationInFrames={60} seed={51} hueShift={0} name="sub-5" />
		</>
	);
};
