import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, Img, staticFile} from 'remotion';

export const StaticDemo: React.FC = () => {
	const [handle1] = useState(() => delayRender('handle1'));
	const [handle2] = useState(() => delayRender('handle2'));

	useEffect(() => {
		throw new Error('oops');
	}, []);

	return (
		<>
			<Img
				src={staticFile('logo.png')}
				onLoad={() => continueRender(handle1)}
			/>
		</>
	);
};
