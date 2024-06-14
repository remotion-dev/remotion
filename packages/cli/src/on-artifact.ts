import type {OnArtifact} from '@remotion/renderer';
import type {ArtifactProgress} from '@remotion/studio-shared';
import {writeFileSync} from 'fs';
import path from 'path';

export const handleOnArtifact = (
	artifactState: ArtifactProgress,
	onProgress: (artifact: ArtifactProgress) => void,
) => {
	const initialProgress = {...artifactState};

	const onArtifact: OnArtifact = (artifact) => {
		// TODO: Normalize backslashes on Windows
		const absoluteOutputDestination = path.join(
			process.cwd(),
			artifact.filename,
		);
		writeFileSync(artifact.filename, artifact.content);

		initialProgress.received.push({
			absoluteOutputDestination,
			filename: artifact.filename,
			sizeInBytes: artifact.content.length,
		});
	};

	onProgress(initialProgress);

	return {
		onArtifact,
	};
};
