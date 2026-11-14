import {
	existsSync,
	lstatSync,
	mkdirSync,
	realpathSync,
	writeFileSync,
} from 'fs';
import path from 'path';
import type {OnArtifact} from '@remotion/renderer';
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
	const initialProgress = {...artifactState};

	const onArtifact: OnArtifact = (artifact) => {
		// It would be nice in the future to customize the artifact output destination

		const relativeOutputDestination = path.join(
			'out',
			compositionId,
			artifact.filename.replace('/', path.sep),
		);
		const defaultOutName = path.join(process.cwd(), relativeOutputDestination);

		const outputDirectory = path.join(process.cwd(), 'out', compositionId);
		const relativeToOutputDirectory = path.relative(
			outputDirectory,
			defaultOutName,
		);
		if (
			relativeToOutputDirectory === '..' ||
			relativeToOutputDirectory.startsWith(`..${path.sep}`) ||
			path.isAbsolute(relativeToOutputDirectory)
		) {
			throw new Error(
				`The artifact filename "${artifact.filename}" points outside of the output directory.`,
			);
		}

		if (!existsSync(path.dirname(defaultOutName))) {
			mkdirSync(path.dirname(defaultOutName), {
				recursive: true,
			});
		}

		if (
			existsSync(defaultOutName) &&
			lstatSync(defaultOutName).isSymbolicLink()
		) {
			throw new Error(
				`The artifact filename "${artifact.filename}" points at a symbolic link.`,
			);
		}

		const resolvedOutputDirectory = realpathSync(outputDirectory);
		const resolvedDestinationDirectory = realpathSync(
			path.dirname(defaultOutName),
		);
		const relativeResolvedDestination = path.relative(
			resolvedOutputDirectory,
			resolvedDestinationDirectory,
		);
		if (
			relativeResolvedDestination === '..' ||
			relativeResolvedDestination.startsWith(`..${path.sep}`) ||
			path.isAbsolute(relativeResolvedDestination)
		) {
			throw new Error(
				`The artifact filename "${artifact.filename}" resolves outside of the output directory.`,
			);
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
