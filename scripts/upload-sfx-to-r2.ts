import {readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import {S3Client} from 'bun';

const filesDir = path.join(import.meta.dir, '../packages/remotion-media/files');
const envFile =
	process.env.REMOTION_MEDIA_ENV ??
	'/Users/jonathanburger/remotion/packages/remotion-media/.env';

// Load credentials from user's .env without printing them
const envText = await Bun.file(envFile).text();
for (const line of envText.split('\n')) {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) continue;
	const eq = trimmed.indexOf('=');
	if (eq === -1) continue;
	const key = trimmed.slice(0, eq).trim();
	const value = trimmed.slice(eq + 1).trim();
	if (!process.env[key]) {
		process.env[key] = value;
	}
}

const awsSecretAccessKey =
	process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_ACCESS_SECRET_KEY;

if (!process.env.AWS_ACCESS_KEY_ID || !awsSecretAccessKey) {
	throw new Error(`Missing AWS credentials in ${envFile}`);
}

const client = new S3Client({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: awsSecretAccessKey,
	endpoint:
		'https://2fe488b3b0f4deee223aef7464784c46.r2.cloudflarestorage.com',
	bucket: 'parser-media',
});

const wavs = readdirSync(filesDir).filter((f) => f.endsWith('.wav'));
let uploaded = 0;
let skipped = 0;

for (const file of wavs) {
	const filePath = path.join(filesDir, file);
	const fileToUpload = Bun.file(filePath);
	const exists = await client.exists(file);
	if (exists) {
		const remote = await client.stat(file);
		if (remote.size === fileToUpload.size) {
			console.log(`Skip ${file} (same size on R2)`);
			skipped++;
			continue;
		}
	}

	await client.write(file, fileToUpload);
	console.log(`Uploaded ${file} (${statSync(filePath).size} bytes)`);
	uploaded++;
}

console.log(`Done: ${uploaded} uploaded, ${skipped} skipped, ${wavs.length} total`);
