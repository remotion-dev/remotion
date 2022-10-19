import type {Codec, FfmpegExecutable} from '@remotion/renderer';
import {combineVideos, RenderInternals} from '@remotion/renderer';
import fs, {
	createWriteStream,
	existsSync,
	mkdirSync,
	promises,
	rmdirSync,
	rmSync,
} from 'fs';
import path, {join} from 'path';
import type {AwsRegion} from '../../pricing/aws-regions';
import {
	chunkKey,
	CONCAT_FOLDER_TOKEN,
	getErrorKeyPrefix,
	REMOTION_CONCATED_TOKEN,
	REMOTION_FILELIST_TOKEN,
	rendersPrefix,
} from '../../shared/constants';
import type {LambdaCodec} from '../../shared/validate-lambda-codec';
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

const getAllFilesS3 = ({
	bucket,
	expectedFiles,
	outdir,
	renderId,
	region,
	expectedBucketOwner,
	onErrors,
}: {
	bucket: string;
	expectedFiles: number;
	outdir: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	onErrors: (errors: EnhancedErrorInfo[]) => Promise<void>;
}): Promise<string[]> => {
	const alreadyDownloading: {[key: string]: true} = {};
	const downloaded: {[key: string]: true} = {};

	const getFiles = async () => {
		const prefix = rendersPrefix(renderId);
		const lsTimer = timer('Listing files');
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
			errorContents: contents.filter((c) =>
				c.Key?.startsWith(getErrorKeyPrefix(renderId))
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
					expectedFiles + ' files expected'
				);
				if (areAllFilesDownloaded) {
					console.log('All files are downloaded!');
					resolve(
						filesInBucket.map((file) =>
							getChunkDownloadOutputLocation({outdir, file})
						)
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
				await onErrors(errors);
				// Will die here
			}

			filesInBucket.forEach(async (key) => {
				if (alreadyDownloading[key]) {
					return;
				}

				alreadyDownloading[key] = true;
				try {
					const downloadTimer = timer('Downloading ' + key);
					await downloadS3File({
						bucket,
						key,
						outdir,
						region,
						expectedBucketOwner,
					});
					console.log('Successfully downloaded', key);
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
	bucket,
	expectedFiles,
	onProgress,
	numberOfFrames,
	renderId,
	region,
	codec,
	expectedBucketOwner,
	fps,
	numberOfGifLoops,
	ffmpegExecutable,
	remotionRoot,
	onErrors,
}: {
	bucket: string;
	expectedFiles: number;
	onProgress: (frames: number, encodingStart: number) => void;
	onErrors: (errors: EnhancedErrorInfo[]) => Promise<void>;
	numberOfFrames: number;
	renderId: string;
	region: AwsRegion;
	codec: LambdaCodec;
	expectedBucketOwner: string;
	fps: number;
	numberOfGifLoops: number | null;
	ffmpegExecutable: FfmpegExecutable;
	remotionRoot: string;
}) => {
	const outdir = join(RenderInternals.tmpDir(CONCAT_FOLDER_TOKEN), 'bucket');
	if (existsSync(outdir)) {
		(rmSync ?? rmdirSync)(outdir, {
			recursive: true,
		});
	}

	mkdirSync(outdir);
	const files = await getAllFilesS3({
		bucket,
		expectedFiles,
		outdir,
		renderId,
		region,
		expectedBucketOwner,
		onErrors,
	});

	const outfile = join(
		RenderInternals.tmpDir(REMOTION_CONCATED_TOKEN),
		'concat.' + RenderInternals.getFileExtensionFromCodec(codec, 'final')
	);
	const combine = timer('Combine videos');
	const filelistDir = RenderInternals.tmpDir(REMOTION_FILELIST_TOKEN);
	const encodingStart = Date.now();

	const codecForCombining: Codec = codec === 'h264-mkv' ? 'h264' : codec;

	await combineVideos({
		files,
		filelistDir,
		output: outfile,
		onProgress: (p) => onProgress(p, encodingStart),
		numberOfFrames,
		codec: codecForCombining,
		fps,
		numberOfGifLoops,
		ffmpegExecutable,
		remotionRoot,
	});
	combine.end();

	const cleanupChunksProm = (fs.promises.rm ?? fs.promises.rmdir)(outdir, {
		recursive: true,
	});
	return {outfile, cleanupChunksProm, encodingStart};
};
