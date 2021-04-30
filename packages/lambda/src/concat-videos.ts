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
	return new Promise<string[]>((resolve) => {
		const loop = async () => {
			const files = readdirSync(efsRemotionVideoPath);
			console.log(files);
			const txtFiles = readdirSync(efsRemotionVideoRenderDone);
			const areAllFilesDownloading = Boolean(
				files.length === expectedFiles && txtFiles.length === expectedFiles
			);

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
		const getAllTimes = timer('get all files');
		const files = await getAllFiles({
			efsRemotionVideoPath,
			expectedFiles,
			efsRemotionVideoRenderDone,
		});
		getAllTimes.end();

		const outfile = join(tmpDir('remotion-concated'), 'concat.mp4');
		const combine = timer('Combine videos');
		const filelistDir = tmpDir('remotion-filelist');
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
