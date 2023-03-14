import {CliInternals} from '@remotion/cli';
import {Internals} from 'remotion';

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
	bucketCreated: boolean;
	doneIn: number | null;
};

export const makeBucketProgress = ({
	bucketCreated,
	doneIn,
}: BucketCreationProgress) => {
	const states = [bucketCreated];
	const statesFinished = states.filter(Boolean).map((p) => p).length;
	const progress = statesFinished / states.length;

	return [
		`(2/3)`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Creating' : 'Created'} bucket`,
		doneIn === null
			? `${statesFinished} / ${states.length}`
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
			.join(',')} ${total === 1 ? 'file' : 'files'})`
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
		`(3/3)`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Uploading' : 'Uploaded'} to GCP Storage Bucket`,
		doneIn === null
			? typeof totalSize === 'number'
				? `${CliInternals.formatBytes(sizeUploaded)}/${CliInternals.formatBytes(
						totalSize
				  )}`
				: ''
			: CliInternals.chalk.gray(`${doneIn}ms`),
		makeUploadDiff({stats}),
	]
		.filter(Internals.truthy)
		.join(' ');
};
