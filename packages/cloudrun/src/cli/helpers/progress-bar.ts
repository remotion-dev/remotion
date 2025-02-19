import {CliInternals} from '@remotion/cli';
import {Internals} from 'remotion';

export type BundleProgress = {
	progress: number;
	doneIn: number | null;
};

export const makeBundleProgress = ({progress, doneIn}: BundleProgress) => {
	return [
		`${doneIn === null ? 'Bundling' : 'Bundled'} video`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress / 100, false),
		doneIn === null
			? `${Math.round(progress)}%`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export type BucketCreationProgress = {
	creationState:
		| 'Checking bucket'
		| 'Creating bucket'
		| 'Created bucket'
		| 'Used bucket';
	doneIn: number | null;
};

export const makeBucketProgress = ({
	creationState,
	doneIn,
}: BucketCreationProgress) => {
	let progress = 0;
	let statesFinished = 0;

	switch (creationState) {
		case 'Checking bucket':
			progress = 1;
			break;

		case 'Creating bucket':
			progress = 2 / 3;
			statesFinished = 2;
			break;

		case 'Created bucket':
			progress = 3 / 3;
			statesFinished = 3;
			break;

		case 'Used bucket':
			progress = 3 / 3;
			statesFinished = 3;
			break;

		default:
			progress = 0;
			break;
	}

	return [
		creationState.padEnd(CliInternals.LABEL_WIDTH, ' '),
		CliInternals.makeProgressBar(progress, false),
		doneIn === null
			? `${statesFinished} / ${3}`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

type UploadStats = {
	addedFiles: number;
	removedFiles: number;
	untouchedFiles: number;
};

export type DeployToStorageProgress = {
	sizeUploaded: number;
	totalSize: number | null;
	doneIn: number | null;
	stats: UploadStats | null;
};

const makeUploadDiff = ({stats}: {stats: UploadStats | null}) => {
	if (!stats) {
		return null;
	}

	if (stats.addedFiles === 0 && stats.removedFiles === 0) {
		return CliInternals.chalk.gray(`(Unchanged)`);
	}

	const total = stats.addedFiles + stats.removedFiles;
	return CliInternals.chalk.gray(
		`(${[
			stats.addedFiles ? `+${stats.addedFiles}` : null,
			stats.removedFiles ? `-${stats.removedFiles}` : null,
		]
			.filter(Internals.truthy)
			.join(',')} ${total === 1 ? 'file' : 'files'})`,
	);
};

export const makeDeployProgressBar = ({
	sizeUploaded,
	totalSize,
	doneIn,
	stats,
}: DeployToStorageProgress) => {
	const progress = totalSize === null ? 0 : sizeUploaded / totalSize;
	return [
		`${doneIn === null ? 'Uploading' : 'Uploaded'}`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress, false),
		doneIn === null
			? typeof totalSize === 'number'
				? `${CliInternals.formatBytes(sizeUploaded)}/${CliInternals.formatBytes(
						totalSize,
					)}`
				: ''
			: CliInternals.chalk.gray(`${doneIn}ms`),
		makeUploadDiff({stats}),
	]
		.filter(Internals.truthy)
		.join(' ');
};
