import React, {Suspense, useLayoutEffect} from 'react';
import {useDelayRender} from 'remotion';

const Unblocker: React.FC = () => {
	const {delayRender, continueRender} = useDelayRender();
	if (typeof document !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			const handle = delayRender(
				`Waiting for <Suspense /> of <ThreeCanvas /> to resolve`,
			);
			return () => {
				continueRender(handle);
			};
		}, [continueRender, delayRender]);
	}

	return null;
};

export const SuspenseLoader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return <Suspense fallback={<Unblocker />}>{children}</Suspense>;
};
