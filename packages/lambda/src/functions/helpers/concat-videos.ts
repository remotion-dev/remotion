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
import type {Codec} from 'remotion';
import type {AwsRegion} from '../../pricing/aws-regions';
import {
	chunkKey,
	CONCAT_FOLDER_TOKEN,
	REMOTION_CONCATED_TOKEN,
	REMOTION_FILELIST_TOKEN,
} from '../../shared/constants';
import type {LambdaCodec} from '../../shared/validate-lambda-codec';
import {lambdaLs, lambdaReadFile} from './io';
import {timer} from './timer';

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
}: {
	bucket: string;
	expectedFiles: number;
	outdir: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}): Promise<string[]> => {
	const alreadyDownloading: {[key: string]: true} = {};
	const downloaded: {[key: string]: true} = {};

	const getFiles = async () => {
		const prefix = chunkKey(renderId);
		const lsTimer = timer('Listing files');
		const contents = await lambdaLs({
			bucketName: bucket,
			prefix,
			region,
			expectedBucketOwner,
		});
		lsTimer.end();
		return contents
			.filter((c) => c.Key?.startsWith(chunkKey(renderId)))
			.map((_) => _.Key as string);
	};

	return new Promise<string[]>((resolve, reject) => {
		const loop = async () => {
			const filesInBucket = await getFiles();
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
					loop();
				}, 100);
			}
		};

		loop();
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
}: {
	bucket: string;
	expectedFiles: number;
	onProgress: (frames: number, encodingStart: number) => void;
	numberOfFrames: number;
	renderId: string;
	region: AwsRegion;
	codec: LambdaCodec;
	expectedBucketOwner: string;
	fps: number;
	numberOfGifLoops: number | null;
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
	});
	combine.end();

	const cleanupChunksProm = (fs.promises.rm ?? fs.promises.rmdir)(outdir, {
		recursive: true,
	});
	return {outfile, cleanupChunksProm, encodingStart};
};
