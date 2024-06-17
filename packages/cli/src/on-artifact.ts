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
		const absoluteOutputDestination = path.join(
			process.cwd(),
			artifact.filename.replace('/', path.sep),
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
