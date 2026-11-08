import React, {Suspense, useLayoutEffect} from 'react';
import {Internals, useDelayRender} from 'remotion';

const Unblocker: React.FC = () => {
	const {delayRender, continueRender} = useDelayRender();
	const videoEnabled = Internals.useVideoEnabled();
	if (typeof document !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (!videoEnabled) {
				return;
			}

			const handle = delayRender(
				`Waiting for <Suspense /> of <ThreeCanvas /> to resolve`,
			);
			return () => {
				continueRender(handle);
			};
		}, [continueRender, delayRender, videoEnabled]);
	}

	return null;
};

export const SuspenseLoader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return <Suspense fallback={<Unblocker />}>{children}</Suspense>;
};
