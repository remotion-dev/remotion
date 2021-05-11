import {ListObjectsCommand, S3Client} from '@aws-sdk/client-s3';
import {combineVideos} from '@remotion/renderer';
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	promises,
	rmdirSync,
} from 'fs';
import {join} from 'path';
import xns from 'xns';
import {lambdaReadFile} from './io';
import {timer} from './timer';
import {tmpDir} from './tmpdir';

const downloadS3File = async ({
	s3Client,
	bucket,
	content,
	outdir,
}: {
	s3Client: S3Client;
	bucket: string;
	content: string;
	outdir: string;
}) => {
	const Body = await lambdaReadFile({
		bucketName: bucket,
		key: content,
	});
	const outpath = join(outdir, content);
	if (Buffer.isBuffer(Body)) {
		return promises.writeFile(outpath, Body);
	}

	return new Promise<void>((resolve, reject) => {
		Body.pipe(createWriteStream(outpath))
			.on('error', (err) => reject(err))
			.on('close', () => resolve());
	});
};

const getAllFilesS3 = async ({
	s3Client,
	bucket,
	expectedFiles,
	outdir,
}: {
	s3Client: S3Client;
	bucket: string;
	expectedFiles: number;
	outdir: string;
}): Promise<string[]> => {
	const alreadyDownloading: {[key: string]: true} = {};
	const downloaded: {[key: string]: true} = {};

	const getFiles = async () => {
		const lsTimer = timer('Listing files');
		const files = await s3Client.send(
			new ListObjectsCommand({
				Bucket: bucket,
			})
		);
		lsTimer.end();
		return (
			(files.Contents || [])
				// TODO make prefix generic
				.filter((c) => c.Key?.startsWith('chunk-'))
				.map((_) => _.Key as string)
		);
	};

	return new Promise<string[]>((resolve, reject) => {
		const loop = async () => {
			const filesInBucket = await getFiles();
			const checkFinish = () => {
				const areAllFilesDownloaded =
					Object.keys(downloaded).length === expectedFiles;
				if (areAllFilesDownloaded) {
					resolve(filesInBucket.map((file) => join(outdir, file)));
				}
			};

			filesInBucket.forEach(async (content) => {
				if (alreadyDownloading[content]) {
					return;
				}

				alreadyDownloading[content] = true;
				try {
					const downloadTimer = timer('Downloading ' + content);
					await downloadS3File({
						bucket,
						content,
						outdir,
						s3Client,
					});
					downloadTimer.end();
					downloaded[content] = true;
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
	s3Client,
	bucket,
	expectedFiles,
	onProgress,
}: {
	s3Client: S3Client;
	bucket: string;
	expectedFiles: number;
	onProgress: (frames: number) => void;
}) => {
	const outdir = join(tmpDir('remotion-concat'), 'bucket');
	if (existsSync(outdir)) {
		rmdirSync(outdir, {
			recursive: true,
		});
	}

	mkdirSync(outdir);
	const files = await getAllFilesS3({
		s3Client,
		bucket,
		expectedFiles,
		outdir,
	});

	const outfile = join(tmpDir('remotion-concated'), 'concat.mp4');
	const combine = timer('Combine videos');
	const filelistDir = tmpDir('remotion-filelist');
	await combineVideos({
		files,
		filelistDir,
		output: outfile,
		onProgress,
	});
	combine.end();

	rmdirSync(outdir, {
		recursive: true,
	});
	return outfile;
};

xns(concatVideosS3);
