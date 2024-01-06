import {CliInternals} from '@remotion/cli';
import {NoReactInternals} from 'remotion/no-react';

export type BundleProgress = {
	progress: number;
	doneIn: number | null;
};

export const makeBundleProgress = ({progress, doneIn}: BundleProgress) => {
	return [
		`(1/3)`,
		CliInternals.makeProgressBar(progress / 100),
		`${doneIn === null ? 'Bundling' : 'Bundled'} video`,
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
		`(2/3)`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Creating' : 'Created'} bucket`,
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

export const makeDeployProgressBar = ({
	sizeUploaded,
	totalSize,
	doneIn,
	stats,
}: DeployToS3Progress) => {
	const progress = totalSize === null ? 0 : sizeUploaded / totalSize;
	return [
		`(3/3)`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Uploading' : 'Uploaded'} to S3`,
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
