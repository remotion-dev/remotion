import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './MyComposition';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComposition"
				component={MyComposition}
				fps={30}
				height={1080}
				width={1080}
				durationInFrames={60}
			/>
		</>
	);
};
