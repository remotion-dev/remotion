import type {OnArtifact} from '@remotion/renderer';
import {writeFileSync} from 'fs';

export const onArtifactOnCli: OnArtifact = (artifact) => {
	writeFileSync(artifact.filename, artifact.content);
};
