import {
	GetObjectCommand,
	ListObjectsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {combineVideos} from '@remotion/renderer';
import {createWriteStream, existsSync, mkdirSync, rmdirSync} from 'fs';
import {join} from 'path';
import {Readable} from 'stream';
import xns from 'xns';
import {REGION} from './constants';

export const concatVideos = xns(
	async (
		s3Client: S3Client = new S3Client({region: REGION}),
		bucket = 'remotion-renders-0.7182592846197402'
	) => {
		const filesInBucket = await s3Client.send(
			new ListObjectsCommand({
				Bucket: bucket,
			})
		);
		if (!filesInBucket.Contents) {
			throw new Error('No contents');
		}
		const outdir = join(process.cwd(), 'bucket');
		if (existsSync(outdir)) {
			rmdirSync(outdir, {
				recursive: true,
			});
		}
		mkdirSync(outdir);
		for (const file of filesInBucket.Contents) {
			const {Body} = await s3Client.send(
				new GetObjectCommand({
					Bucket: bucket,
					Key: file.Key,
				})
			);
			const outpath = join(outdir, file.Key as string);
			await new Promise<void>((resolve, reject) => {
				(Body as Readable)
					.pipe(createWriteStream(outpath))
					.on('error', (err) => reject(err))
					.on('close', () => resolve());
			});
		}

		const files = filesInBucket.Contents.map((file) =>
			join(outdir, file.Key as string)
		);

		const outfile = join(__dirname, 'concat.mp4');
		await combineVideos(files, outfile);

		console.log(outfile);
	}
);
