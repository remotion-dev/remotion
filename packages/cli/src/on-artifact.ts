import {
	closeSync,
	constants,
	existsSync,
	lstatSync,
	mkdirSync,
	openSync,
	writeFileSync,
} from 'fs';
import path from 'path';
import type {OnArtifact} from '@remotion/renderer';
import type {ArtifactProgress} from '@remotion/studio-shared';

const assertNoSymlinks = ({
	outputDirectory,
	destination,
	filename,
}: {
	outputDirectory: string;
	destination: string;
	filename: string;
}) => {
	const relativePath = path.relative(outputDirectory, destination);

	let current = outputDirectory;
	for (const segment of relativePath.split(path.sep)) {
		current = path.join(current, segment);

		try {
			if (lstatSync(current).isSymbolicLink()) {
				throw new Error(
					`The artifact filename "${filename}" would be written through a symbolic link.`,
				);
			}
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
				break;
			}

			throw err;
		}
	}
};

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

		const outputDirectory = path.join(process.cwd(), 'out', compositionId);
		const relativeOutputDestination = path.join(
			'out',
			compositionId,
			artifact.filename.replace('/', path.sep),
		);
		const defaultOutName = path.join(process.cwd(), relativeOutputDestination);

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

		assertNoSymlinks({
			outputDirectory,
			destination: defaultOutName,
			filename: artifact.filename,
		});

		const alreadyExisted = existsSync(defaultOutName);

		mkdirSync(path.dirname(defaultOutName), {
			recursive: true,
		});

		// Re-check after creating the directory in case a symlink appeared in the
		// meantime. `O_NOFOLLOW` closes the remaining race on POSIX systems.
		assertNoSymlinks({
			outputDirectory,
			destination: defaultOutName,
			filename: artifact.filename,
		});

		const fileDescriptor = openSync(
			defaultOutName,
			constants.O_CREAT |
				constants.O_WRONLY |
				constants.O_TRUNC |
				(process.platform === 'win32' ? 0 : constants.O_NOFOLLOW),
			0o666,
		);
		try {
			writeFileSync(fileDescriptor, artifact.content);
		} finally {
			closeSync(fileDescriptor);
		}

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
