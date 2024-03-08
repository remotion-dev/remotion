import type {AudioCodec, CancelSignal, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs, {createWriteStream, promises} from 'node:fs';
import path, {join} from 'node:path';
import type {AwsRegion} from '../../pricing/aws-regions';
import {
	chunkKey,
	getErrorKeyPrefix,
	REMOTION_CONCATED_TOKEN,
	REMOTION_FILELIST_TOKEN,
	rendersPrefix,
} from '../../shared/constants';
import type {LambdaCodec} from '../../shared/validate-lambda-codec';
import {
	canConcatAudioSeamlessly,
	canConcatVideoSeamlessly,
} from './can-concat-seamlessly';
import {inspectErrors} from './inspect-errors';
import {lambdaLs, lambdaReadFile} from './io';
import {timer} from './timer';
import type {EnhancedErrorInfo} from './write-lambda-error';

const getChunkDownloadOutputLocation = ({
	outdir,
	file,
}: {
	outdir: string;
	file: string;
}) => {
	return path.join(outdir, path.basename(file));
};

const downloadS3File = async ({
	bucket,
	key,
	outdir,
	region,
	expectedBucketOwner,
}: {
	bucket: string;
	key: string;
	outdir: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}) => {
	const Body = await lambdaReadFile({
		bucketName: bucket,
		key,
		region,
		expectedBucketOwner,
	});
	const outpath = getChunkDownloadOutputLocation({outdir, file: key});
	if (Buffer.isBuffer(Body)) {
		return promises.writeFile(outpath, Body);
	}

	return new Promise<void>((resolve, reject) => {
		Body.pipe(createWriteStream(outpath))
			.on('error', (err) => reject(err))
			.on('close', () => resolve());
	});
};

export const getAllFilesS3 = ({
	bucket,
	expectedFiles,
	outdir,
	renderId,
	region,
	expectedBucketOwner,
	onErrors,
	logLevel,
}: {
	bucket: string;
	expectedFiles: number;
	outdir: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	onErrors: (errors: EnhancedErrorInfo[]) => void;
	logLevel: LogLevel;
}): Promise<string[]> => {
	const alreadyDownloading: {[key: string]: true} = {};
	const downloaded: {[key: string]: true} = {};

	const getFiles = async () => {
		const prefix = rendersPrefix(renderId);
		const lsTimer = timer('Listing files', logLevel);
		const contents = await lambdaLs({
			bucketName: bucket,
			prefix,
			region,
			expectedBucketOwner,
		});
		lsTimer.end();
		return {
			filesInBucket: contents
				.filter((c) => c.Key?.startsWith(chunkKey(renderId)))
				.map((_) => _.Key as string),
			errorContents: contents.filter(
				(c) => c.Key?.startsWith(getErrorKeyPrefix(renderId)),
			),
		};
	};

	return new Promise<string[]>((resolve, reject) => {
		const loop = async () => {
			const {filesInBucket, errorContents} = await getFiles();
			const checkFinish = () => {
				const areAllFilesDownloaded =
					Object.keys(downloaded).length === expectedFiles;
				console.log(
					'Checking for finish... ',
					Object.keys(downloaded),
					expectedFiles + ' files expected',
				);
				if (areAllFilesDownloaded) {
					console.log('All files are downloaded!');
					resolve(
						// Need to use downloaded variable, not filesInBucket
						// as it may be out of date
						Object.keys(downloaded)
							.sort()
							.map((file) => getChunkDownloadOutputLocation({outdir, file})),
					);
				}
			};

			console.log('Found ', filesInBucket);
			const errors = (
				await inspectErrors({
					bucket,
					contents: errorContents,
					expectedBucketOwner,
					region,
					renderId,
				})
			).filter((e) => e.isFatal);

			if (errors.length > 0) {
				onErrors(errors);
				// Will die here
			}

			filesInBucket.forEach(async (key) => {
				if (alreadyDownloading[key]) {
					return;
				}

				alreadyDownloading[key] = true;
				try {
					const downloadTimer = timer('Downloading ' + key, logLevel);
					await downloadS3File({
						bucket,
						key,
						outdir,
						region,
						expectedBucketOwner,
					});
					RenderInternals.Log.info(
						{indent: false, logLevel},
						'Successfully downloaded',
						key,
					);
					downloadTimer.end();
					downloaded[key] = true;
					checkFinish();
				} catch (err) {
					reject(err);
				}
			});

			const areAllFilesDownloading =
				Object.keys(alreadyDownloading).length === expectedFiles;
			if (!areAllFilesDownloading) {
				setTimeout(() => {
					loop().catch((err) => reject(err));
				}, 100);
			}
		};

		loop().catch((err) => reject(err));
	});
};

export const concatVideosS3 = async ({
	onProgress,
	numberOfFrames,
	codec,
	fps,
	numberOfGifLoops,
	files,
	outdir,
	audioCodec,
	audioBitrate,
	logLevel,
	framesPerLambda,
	binariesDirectory,
	cancelSignal,
}: {
	onProgress: (frames: number) => void;
	numberOfFrames: number;
	codec: LambdaCodec;
	fps: number;
	numberOfGifLoops: number | null;
	files: string[];
	outdir: string;
	audioCodec: AudioCodec | null;
	audioBitrate: string | null;
	logLevel: LogLevel;
	framesPerLambda: number;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}) => {
	const outfile = join(
		RenderInternals.tmpDir(REMOTION_CONCATED_TOKEN),
		`concat.${RenderInternals.getFileExtensionFromCodec(codec, audioCodec)}`,
	);
	const combine = timer('Combine videos', logLevel);
	const filelistDir = RenderInternals.tmpDir(REMOTION_FILELIST_TOKEN);

	const chunkDurationInSeconds = framesPerLambda / fps;

	const seamlessAudio = canConcatAudioSeamlessly(audioCodec);
	const seamlessVideo = canConcatVideoSeamlessly(codec);

	await RenderInternals.combineVideos({
		files,
		filelistDir,
		output: outfile,
		onProgress,
		numberOfFrames,
		codec,
		fps,
		numberOfGifLoops,
		audioCodec,
		audioBitrate,
		indent: false,
		logLevel,
		chunkDurationInSeconds,
		binariesDirectory,
		cancelSignal,
		seamlessAudio,
		seamlessVideo,
	});
	combine.end();

	const cleanupChunksProm = fs.promises.rm(outdir, {
		recursive: true,
		force: true,
	});
	return {outfile, cleanupChunksProm};
};
