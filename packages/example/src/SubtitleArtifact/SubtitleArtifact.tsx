import React from 'react';
import {Artifact, useCurrentFrame} from 'remotion';

export const SubtitleArtifact: React.FC = () => {
	const frame = useCurrentFrame();

	return frame === 0 ? (
		<Artifact
			content={
				new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
			}
			filename="hello-uint8.txt"
		/>
	) : frame === 1 ? (
		<Artifact content="Hello World" filename="hello.txt" />
	) : null;
};
