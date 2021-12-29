import React, { Suspense, useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

const Unblocker: React.FC = () => {
	const [handle] = useState(() => delayRender());
	useEffect(() => {
		return () => {
			continueRender(handle);
		};
	}, [handle]);
	return null;
};

export const SuspenseLoader: React.FC = ({ children }) => {
	return <Suspense fallback={<Unblocker />}>{children}</Suspense>;
};
