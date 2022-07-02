import {CliInternals} from '@remotion/cli';
import {Internals} from 'remotion';

export type BundleProgress = {
	progress: number;
	doneIn: number | null;
};

export const makeBundleProgress = ({progress, doneIn}: BundleProgress) => {
	return [
		'📦',
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
	websiteEnabled: boolean;
	doneIn: number | null;
	steps: number;
	currentStep: number;
};

export const makeBucketProgress = ({
	bucketCreated,
	websiteEnabled,
	doneIn,
	steps,
	currentStep,
}: BucketCreationProgress) => {
	const states = [bucketCreated, websiteEnabled];
	const statesFinished = states.filter(Boolean).map((p) => p).length;
	const progress = statesFinished / states.length;

	return [
		'🪣 ',
		`(${currentStep}/${steps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Creating' : 'Created'} bucket`,
		doneIn === null
			? `${statesFinished} / ${states.length}`
			: CliInternals.chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export type DeployToS3Progress = {
	sizeUploaded: number;
	totalSize: number | null;
	doneIn: number | null;
	steps: number;
	currentStep: number;
};

export const makeDeployProgressBar = ({
	sizeUploaded,
	totalSize,
	doneIn,
	steps,
	currentStep,
}: DeployToS3Progress) => {
	const progress = totalSize === null ? 0 : sizeUploaded / totalSize;
	return [
		'☁️ ',
		`(${currentStep}/${steps})`,
		CliInternals.makeProgressBar(progress),
		`${doneIn === null ? 'Uploading' : 'Uploaded'} to S3`,
		doneIn === null
			? typeof totalSize === 'number'
				? `${CliInternals.formatBytes(sizeUploaded)}/${CliInternals.formatBytes(
						totalSize
				  )}`
				: ''
			: CliInternals.chalk.gray(`${doneIn}ms`),
	]
		.filter(Internals.truthy)
		.join(' ');
};
