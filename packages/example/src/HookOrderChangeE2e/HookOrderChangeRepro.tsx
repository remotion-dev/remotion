// Regression fixture for https://github.com/remotion-dev/remotion/issues/7398
// The e2e test toggles the hook count below to confirm the Studio refreshes.
import React from 'react';
import {Composition, useCurrentFrame} from 'remotion';

const HookOrderChangeRepro: React.FC = () => {
	const frame = useCurrentFrame();

	return <div data-frame={frame}>one hook</div>;
};

export const HookOrderChangeE2e: React.FC = () => {
	return (
		<Composition
			id="hook-order-change-e2e"
			component={HookOrderChangeRepro}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={60}
		/>
	);
};
