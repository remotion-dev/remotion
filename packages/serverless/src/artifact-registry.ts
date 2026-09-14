import type {EmittedArtifact} from '@remotion/renderer';

type ArtifactRegistration = {
	chunk: number;
	frame: number;
	attempt: number;
	filename: string;
};

export type ArtifactRegistrationResult =
	| {type: 'accepted'}
	| {type: 'retry-replay'}
	| {type: 'conflict'};

export type OnArtifactFromRenderer = (params: {
	artifact: EmittedArtifact;
	chunk: number;
	attempt: number;
}) => ArtifactRegistrationResult;

export const makeArtifactRegistry = () => {
	const artifactsByFilename = new Map<string, ArtifactRegistration>();
	const artifactsByAttempt = new Set<string>();

	const registerArtifact = (
		artifact: ArtifactRegistration,
	): ArtifactRegistrationResult => {
		const attemptKey = JSON.stringify([
			artifact.chunk,
			artifact.attempt,
			artifact.filename,
		]);
		if (artifactsByAttempt.has(attemptKey)) {
			return {type: 'conflict'};
		}

		artifactsByAttempt.add(attemptKey);
		const existingArtifact = artifactsByFilename.get(artifact.filename);
		if (!existingArtifact) {
			artifactsByFilename.set(artifact.filename, artifact);
			return {type: 'accepted'};
		}

		if (
			existingArtifact.chunk === artifact.chunk &&
			existingArtifact.frame === artifact.frame &&
			artifact.attempt > existingArtifact.attempt
		) {
			return {type: 'retry-replay'};
		}

		return {type: 'conflict'};
	};

	return {registerArtifact};
};
