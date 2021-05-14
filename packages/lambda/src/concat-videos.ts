import {combineVideos} from '@remotion/renderer';
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	promises,
	rmdirSync,
} from 'fs';
import path, {join} from 'path';
import xns from 'xns';
import {EFS_MOUNT_PATH, ENABLE_EFS} from './constants';
import {lambdaLs, lambdaReadFile} from './io';
import {timer} from './timer';
import {tmpDir} from './tmpdir';

const downloadS3File = async ({
	bucket,
	content,
	outdir,
}: {
	bucket: string;
	content: string;
	outdir: string;
}) => {
	if (ENABLE_EFS) {
		return Promise.resolve();
	}

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
	bucket,
	expectedFiles,
	outdir,
}: {
	bucket: string;
	expectedFiles: number;
	outdir: string;
}): Promise<string[]> => {
	const alreadyDownloading: {[key: string]: true} = {};
	const downloaded: {[key: string]: true} = {};

	const getFiles = async () => {
		const lsTimer = timer('Listing files');
		const contents = await lambdaLs({bucketName: bucket, forceS3: false});
		lsTimer.end();
		return (
			contents
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
					if (ENABLE_EFS) {
						resolve(
							filesInBucket.map((file) =>
								path.join(EFS_MOUNT_PATH + '/' + bucket, file)
							)
						);
					} else {
						resolve(filesInBucket.map((file) => join(outdir, file)));
					}
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
	bucket,
	expectedFiles,
	onProgress,
	numberOfFrames,
}: {
	bucket: string;
	expectedFiles: number;
	onProgress: (frames: number) => void;
	numberOfFrames: number;
}) => {
	const outdir = join(tmpDir('remotion-concat'), 'bucket');
	if (existsSync(outdir)) {
		rmdirSync(outdir, {
			recursive: true,
		});
	}

	mkdirSync(outdir);
	const files = await getAllFilesS3({
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
		numberOfFrames,
	});
	combine.end();

	rmdirSync(outdir, {
		recursive: true,
	});
	return outfile;
};

xns(concatVideosS3);
