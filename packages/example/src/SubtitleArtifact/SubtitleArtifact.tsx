import React from 'react';
import {Experimental, useCurrentFrame} from 'remotion';

export const SubtitleArtifact: React.FC = () => {
	const frame = useCurrentFrame();

	return frame === 0 ? (
		<Experimental.Artifact content="Hello World!" filename="hello.txt" />
	) : null;
};
