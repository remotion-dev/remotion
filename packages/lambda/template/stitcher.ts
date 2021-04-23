import {
	GetObjectCommand,
	ListObjectsCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {stitchFramesToVideo} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {Readable} from 'stream';

// TODO: redundant
const region = 'eu-central-1';

const s3Client = new S3Client({region});

const BIN_DIR = '/tmp/bin';

fs.mkdirSync(BIN_DIR);

export const handler = async (params: {bucket: string}) => {
	console.log(fs.readdirSync('/tmp/bin'), process.env.PATH);
	const id = String(Math.random());
	const dir = `/tmp/${id}`;
	const outdir = `/tmp/${Math.random()}`;
	fs.mkdirSync(dir);
	fs.mkdirSync(outdir);
	const outputLocation = path.join(outdir, 'out.mp4');
	console.log('ready!');
	if (!params.bucket) {
		throw new Error('Did not pass `bucket` param');
	}
	const listBucket = await s3Client.send(
		new ListObjectsCommand({
			Bucket: params.bucket,
		})
	);
	// TODO: If 0 objects, not iterable.
	for (const obj of listBucket.Contents) {
		// TODO: parallel
		const data = await s3Client.send(
			new GetObjectCommand({
				Bucket: params.bucket,
				Key: obj.Key,
			})
		);
		await new Promise<void>((resolve, reject) => {
			(data.Body as Readable)
				.pipe(fs.createWriteStream(path.join(dir, obj.Key)))
				.on('error', (err) => reject(err))
				.on('close', () => resolve());
		});
	}
	console.log(fs.readdirSync(dir));
	await stitchFramesToVideo({
		assetsInfo: {
			// TODO
			assets: [],
			bundleDir: '',
		},
		dir,
		force: true,
		// TODO
		fps: 30,
		// TODO
		height: 1080,
		//TODO,
		width: 1080,
		outputLocation,
		// TODO
		codec: 'h264',
		// TODO
		imageFormat: 'jpeg',
	});
	await s3Client.send(
		new PutObjectCommand({
			Bucket: params.bucket,
			// TODO
			Key: 'out.mp4',
			Body: fs.createReadStream(outputLocation),
		})
	);
	console.log('did stitch! awesome');
};
