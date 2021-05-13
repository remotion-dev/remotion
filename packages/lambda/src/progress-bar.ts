// @ts-expect-error
import ansiDiff from 'ansi-diff';
import chalk from 'chalk';
import {Internals} from 'remotion';
import {formatBytes} from './format-bytes';

export const createProgressBar = () => {
	const diff = ansiDiff();
	process.stdout.write('');
	return {
		update: (up: string): boolean => process.stdout.write(diff.update(up)),
	};
};

export const makeProgressBar = (percentage: number) => {
	const totalBars = 20;
	const barsToShow = Math.floor(percentage * totalBars);
	return `[${'='.repeat(barsToShow).padEnd(totalBars, ' ')}]`;
};

export type BucketCreationProgress = {
	bucketCreated: boolean;
	websiteEnabled: boolean;
	doneIn: number | null;
};

export const makeBucketProgress = ({
	bucketCreated,
	websiteEnabled,
	doneIn,
}: BucketCreationProgress) => {
	const states = [bucketCreated, websiteEnabled];
	const statesFinished = states.filter(Boolean).map((p) => p).length;
	const progress = statesFinished / states.length;

	return [
		'🪣 ',
		`(1/2)`,
		makeProgressBar(progress),
		`${doneIn === null ? 'Creating' : 'Created'} bucket`,
		doneIn === null
			? `${statesFinished} / ${states.length}`
			: chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export type DeployToS3Progress = {
	sizeUploaded: number;
	totalSize: number | null;
	doneIn: number | null;
};

export const makeDeployProgressBar = ({
	sizeUploaded,
	totalSize,
	doneIn,
}: DeployToS3Progress) => {
	const progress = totalSize === null ? 0 : sizeUploaded / totalSize;
	return [
		'☁️ ',
		`(2/2)`,
		makeProgressBar(progress),
		`${doneIn === null ? 'Uploading' : 'Uploaded'} to S3`,
		doneIn === null
			? typeof totalSize === 'number'
				? `${formatBytes(sizeUploaded)}/${formatBytes(totalSize)}`
				: ''
			: chalk.gray(`${doneIn}ms`),
	]
		.filter(Internals.truthy)
		.join(' ');
};
