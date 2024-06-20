import type {OnArtifact} from '@remotion/renderer';
import type {ArtifactProgress} from '@remotion/studio-shared';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import path from 'path';

export const handleOnArtifact = ({
	artifactState,
	onProgress,
	compositionId,
}: {
	artifactState: ArtifactProgress;
	onProgress: (artifact: ArtifactProgress) => void;
	compositionId: string;
}) => {
	const initialProgress = {...artifactState};

	const onArtifact: OnArtifact = (artifact) => {
		// It would be nice in the future to customize the artifact output destination

		const relativeOutputDestination = path.join(
			'out',
			compositionId,
			artifact.filename.replace('/', path.sep),
		);
		const defaultOutName = path.join(process.cwd(), relativeOutputDestination);

		if (!existsSync(path.dirname(defaultOutName))) {
			mkdirSync(path.dirname(defaultOutName), {
				recursive: true,
			});
		}

		const alreadyExisted = existsSync(defaultOutName);

		writeFileSync(defaultOutName, artifact.content);

		initialProgress.received.push({
			absoluteOutputDestination: defaultOutName,
			filename: artifact.filename,
			sizeInBytes: artifact.content.length,
			alreadyExisted,
			relativeOutputDestination,
		});
	};

	onProgress(initialProgress);

	return {
		onArtifact,
	};
};
