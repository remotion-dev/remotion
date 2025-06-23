import React from 'react';
import {AbsoluteFill, Artifact, useCurrentFrame} from 'remotion';

export const SubtitleArtifact: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<AbsoluteFill className="bg-green-400" />
			{frame === 0 ? (
				<Artifact
					content={
						new Uint8Array([
							72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
						])
					}
					filename="hello-uint8.txt"
				/>
			) : frame === 1 ? (
				<Artifact content="Hello World" filename="hello.txt" />
			) : null}
			<Artifact
				content={Artifact.Thumbnail}
				filename={`thumbnail${frame}.jpeg`}
			/>
		</AbsoluteFill>
	);
};
