import React, {Suspense, useLayoutEffect} from 'react';
import {continueRender, delayRender} from 'remotion';

const Unblocker: React.FC = () => {
	if (typeof document !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			const handle = delayRender(
				`Waiting for <Suspense /> of <ThreeCanvas /> to resolve`,
			);
			return () => {
				continueRender(handle);
			};
		}, []);
	}

	return null;
};

export const SuspenseLoader: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return <Suspense fallback={<Unblocker />}>{children}</Suspense>;
};
