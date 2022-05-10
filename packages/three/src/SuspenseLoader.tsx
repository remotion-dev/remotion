import React, {Suspense, useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const Unblocker: React.FC = () => {
	const [handle] = useState(() =>
		delayRender(`Waiting for <Suspense /> of <ThreeCanvas /> to resolve`)
	);
	useEffect(() => {
		return () => {
			continueRender(handle);
		};
	}, [handle]);
	return null;
};

export const SuspenseLoader: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return <Suspense fallback={<Unblocker />}>{children}</Suspense>;
};
