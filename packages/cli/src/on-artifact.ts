import {makeArtifactProgressHandler} from '@remotion/studio-server';
import type {ArtifactProgress} from '@remotion/studio-shared';

export const handleOnArtifact = ({
	artifactState,
	onProgress,
	compositionId,
}: {
	artifactState: ArtifactProgress;
	onProgress: (artifact: ArtifactProgress) => void;
	compositionId: string;
}) => {
	return makeArtifactProgressHandler({
		artifactState,
		onProgress,
		compositionId,
		enforceOutputInsideRoot: false,
		notifyOnArtifact: false,
		notifyOnInit: true,
	});
};
