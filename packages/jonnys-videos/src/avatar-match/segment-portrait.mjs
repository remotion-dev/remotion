import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';
import {URL} from 'node:url';

const workingDirectory =
	process.argv[2] ?? join(tmpdir(), 'remotion-avatar-match');
mkdirSync(workingDirectory, {recursive: true});
const avatarAssets = JSON.parse(
	readFileSync(new URL('./assets.json', import.meta.url), 'utf8'),
);

const require = createRequire(
	new URL('../../../video-matting/package.json', import.meta.url),
);
const {
	AutoModelForImageSegmentation,
	AutoProcessor,
	BackgroundRemovalPipeline,
	RawImage,
	env,
} = require('@huggingface/transformers');

env.cacheDir = join(tmpdir(), 'jonny-avatar-models');
env.remoteHost = 'https://remotion.media/';
env.remotePathTemplate = 'models/{model}/';

const options = {device: 'cpu', dtype: 'fp32'};
const processor = await AutoProcessor.from_pretrained('modnet-v1', options);
const model = await AutoModelForImageSegmentation.from_pretrained(
	'modnet-v1',
	options,
);
const pipeline = new BackgroundRemovalPipeline({
	task: 'background-removal',
	model,
	processor,
});

try {
	const localFrame = join(workingDirectory, 'framed-7860.jpg');
	const input = await RawImage.read(
		existsSync(localFrame) ? localFrame : avatarAssets['framed-7860.jpg'],
	);
	const output = await pipeline(input);
	const alpha = new Uint8ClampedArray(output.width * output.height);
	for (let pixel = 0; pixel < alpha.length; pixel++) {
		alpha[pixel] = output.data[pixel * 4 + 3];
	}

	await new RawImage(alpha, output.width, output.height, 1).save(
		join(workingDirectory, 'segmentation-7860.png'),
	);
} finally {
	await pipeline.dispose();
}
