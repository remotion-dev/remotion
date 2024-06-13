import React from 'react';
import {Artifact, useCurrentFrame} from 'remotion';

export const SubtitleArtifact: React.FC = () => {
	const frame = useCurrentFrame();

	return frame === 0 ? (
		<Artifact content="Hello World!" filename="hello.txt" />
	) : null;
};
