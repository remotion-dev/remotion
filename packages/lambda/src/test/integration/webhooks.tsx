/* eslint-disable no-restricted-imports -- Browser entry bundled for the Lambda integration test. */
import React, {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Composition,
	continueRender,
	delayRender,
	registerRoot,
} from 'remotion';

const Success: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: 'red'}} />
);

const Timeout: React.FC = () => {
	const [handle] = useState(() =>
		delayRender('Wait for the Lambda timeout webhook'),
	);

	useEffect(() => {
		// The simulated Lambda lifetime is one second. Keep its render pending
		// past that deadline, then let the invocation finish and clean up.
		const timeout = setTimeout(() => continueRender(handle), 2000);
		return () => clearTimeout(timeout);
	}, [handle]);

	return <Success />;
};

registerRoot(() => (
	<>
		<Composition
			id="webhook-success"
			component={Success}
			width={32}
			height={32}
			fps={30}
			durationInFrames={1}
		/>
		<Composition
			id="webhook-timeout"
			component={Timeout}
			width={32}
			height={32}
			fps={30}
			durationInFrames={1}
		/>
	</>
));
