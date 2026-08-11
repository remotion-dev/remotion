import React from 'react';
import {Loop, useCurrentFrame} from 'remotion';

const LoopedVideo: React.FC = () => {
	return (
		<Loop durationInFrames={50} times={3} name="MyLoop">
			<Child />
		</Loop>
	);
};

const Child = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				backgroundColor: 'white',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				fontSize: 50,
			}}
		>
			{frame}
		</div>
	);
};

export default LoopedVideo;
