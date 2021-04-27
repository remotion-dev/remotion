import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {combineVideos} from '@remotion/renderer';
import {createWriteStream, readdirSync, rmdirSync} from 'fs';
import {join} from 'path';
import {Readable} from 'stream';
import xns from 'xns';
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
	const {Body} = await s3Client.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: content,
		})
	);
	const outpath = join(outdir, content);
	return new Promise<void>((resolve, reject) => {
		(Body as Readable)
			.pipe(createWriteStream(outpath))
			.on('error', (err) => reject(err))
			.on('close', () => resolve());
	});
};

const getAllFiles = async ({
	efsRemotionVideoPath,
	expectedFiles,
	efsRemotionVideoRenderDone,
}: {
	efsRemotionVideoPath: string;
	expectedFiles: number;
	efsRemotionVideoRenderDone: string;
}): Promise<string[]> => {
	// const alreadyDownloading: {[key: string]: true} = {};
	// const downloaded: {[key: string]: true} = {};

	// const getFiles = async () => {
	// 	const lsTimer = timer('Listing files');
	// 	const files = await s3Client.send(
	// 		new ListObjectsCommand({
	// 			Bucket: bucket,
	// 		})
	// 	);
	// 	lsTimer.end();
	// 	return (files.Contents || []).map((_) => _.Key as string);
	// };

	return new Promise<string[]>((resolve) => {
		const loop = async () => {
			// const filesInBucket = await getFiles();
			// const checkFinish = () => {
			// 	const areAllFilesDownloaded =
			// 		Object.keys(downloaded).length === expectedFiles;
			// 	if (areAllFilesDownloaded) {
			// 		resolve(filesInBucket.map((file) => join(outdir, file)));
			// 	}
			// };
			// filesInBucket.forEach(async (content) => {
			// 	if (alreadyDownloading[content]) {
			// 		return;
			// 	}
			// 	alreadyDownloading[content] = true;
			// 	try {
			// 		const downloadTimer = timer('Downloading ' + content);
			// 		await downloadS3File({
			// 			bucket,
			// 			content,
			// 			outdir,
			// 			s3Client,
			// 		});
			// 		downloadTimer.end();
			// 		downloaded[content] = true;
			// 		checkFinish();
			// 	} catch (err) {
			// 		reject(err);
			// 	}
			// });
			const files = readdirSync(efsRemotionVideoPath);
			const txtFiles = readdirSync(efsRemotionVideoRenderDone);
			const areAllFilesDownloading = Boolean(
				files.length === expectedFiles && txtFiles.length === expectedFiles
			);

			// console.log(
			// 	readdirSync(efsRemotionVideoPath),
			// 	'all files in getAllFiles',
			// 	expectedFiles,
			// 	files.length,
			// 	'expected files',
			// 	areAllFilesDownloading
			// );

			if (!areAllFilesDownloading) {
				setTimeout(() => {
					loop();
				}, 100);
			}
			if (areAllFilesDownloading) {
				resolve(files.map((file) => join(efsRemotionVideoPath, file)));
			}
		};

		loop();
	});
};

export const concatVideos = xns(
	async (
		efsRemotionVideoPath,
		efsRemotionVideoRenderDone,
		expectedFiles = 20
	) => {
		// const outdir = join(tmpDir('remotion-concat'), 'bucket');
		// console.log('outpur dir ', outdir);
		// if (existsSync(outdir)) {
		// 	rmdirSync(outdir, {
		// 		recursive: true,
		// 	});
		// }
		// mkdirSync(outdir);

		const files = await getAllFiles({
			efsRemotionVideoPath,
			expectedFiles,
			efsRemotionVideoRenderDone,
		});

		// while (expectedFiles !== readdirSync(efsRemotionVideoPath).length) {
		// 	console.log(
		// 		'files in concat',
		// 		readdirSync(efsRemotionVideoPath),
		// 		readdirSync(efsRemotionVideoPath).length
		// 	);
		// 	await awaitTimer(100);
		// }
		// const files = readdirSync(efsRemotionVideoPath);
		// console.log(files, 'all files in remotion-video');

		const outfile = join(tmpDir('remotion-concated'), 'concat.mp4');
		const combine = timer('Combine videos');
		const filelistDir = tmpDir('remotion-filelist');
		console.log('all path name', outfile, combine, efsRemotionVideoPath);
		await combineVideos({
			files,
			filelistDir,
			output: outfile,
		});
		combine.end();

		rmdirSync(efsRemotionVideoPath, {
			recursive: true,
		});
		return outfile;
	}
);
