import {CliInternals} from '@remotion/cli';
import {NoReactInternals} from 'remotion/no-react';

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
	doneIn: number | null;
};

export const makeBucketProgress = ({doneIn}: BucketCreationProgress) => {
	const progress = doneIn === null ? 0 : 1;

	return [
		`${doneIn === null ? 'Creating' : 'Created'} bucket`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress, false),
		doneIn === null ? `0/1` : CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

type UploadStats = {
	addedFiles: number;
	removedFiles: number;
	untouchedFiles: number;
};

export type DeployToS3Progress = {
	sizeUploaded: number;
	totalSize: number | null;
	doneIn: number | null;
	stats: UploadStats | null;
};

export type DiffingProgress = {
	doneIn: number | null;
	bytesProcessed: number;
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
			.filter(NoReactInternals.truthy)
			.join(',')} ${total === 1 ? 'file' : 'files'})`,
	);
};

export const makeDiffingProgressBar = ({
	bytesProcessed,
	doneIn,
}: DiffingProgress) => {
	const progress = doneIn === null ? 0 : 1;
	if (bytesProcessed === 0) {
		return null;
	}

	return [
		`${doneIn === null ? 'Calculating changes' : 'Calculated changes'}`.padEnd(
			CliInternals.LABEL_WIDTH,
			' ',
		),
		CliInternals.makeProgressBar(progress, false),
		doneIn === null
			? bytesProcessed === 0
				? null
				: `${CliInternals.formatBytes(bytesProcessed)}`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	]
		.filter(NoReactInternals.truthy)
		.join(' ');
};

export const makeDeployProgressBar = ({
	sizeUploaded,
	totalSize,
	doneIn,
	stats,
}: DeployToS3Progress) => {
	const progress = totalSize === null ? 0 : sizeUploaded / totalSize;
	return [
		`${doneIn === null ? 'Uploading' : 'Uploaded'} to S3`.padEnd(
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
		.filter(NoReactInternals.truthy)
		.join(' ');
};
