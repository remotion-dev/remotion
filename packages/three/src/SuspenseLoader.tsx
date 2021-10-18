import React, { Suspense, useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

const Unblocker: React.FC<{ handle: number }> = ({ handle }) => {
	useEffect(() => {
		return () => {
			continueRender(handle);
		};
	}, [handle]);
	return null;
};

export const SuspenseLoader: React.FC = ({ children }) => {
	const [handle] = useState(() => delayRender());

	return (
		<Suspense fallback={<Unblocker handle={handle} />}>{children}</Suspense>
	);
};
