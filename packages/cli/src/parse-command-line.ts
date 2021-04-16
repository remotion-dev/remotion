import minimist from 'minimist';
import {
	BrowserExecutable,
	Codec,
	Config,
	ImageFormat,
	Internals,
	PixelFormat,
} from 'remotion';
import {Log} from './log';

export type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: ImageFormat;
	['bundle-cache']: string;
	codec: Codec;
	concurrency: number;
	config: string;
	crf: number;
	force: boolean;
	overwrite: boolean;
	png: boolean;
	props: string;
	quality: number;
	frames: string | number;
	sequence: boolean;
};

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2));

export const parseCommandLine = () => {
	if (parsedCli['pixel-format']) {
		Config.Output.setPixelFormat(parsedCli['pixel-format']);
	}
	if (parsedCli['image-format']) {
		Config.Rendering.setImageFormat(parsedCli['image-format']);
	}
	if (parsedCli['browser-executable']) {
		Config.Puppeteer.setBrowserExecutable(parsedCli['browser-executable']);
	}
	if (typeof parsedCli['bundle-cache'] !== 'undefined') {
		Config.Bundling.setCachingEnabled(
			parsedCli['bundle-cache'] === 'false' ? false : true
		);
	}
	if (parsedCli.concurrency) {
		Config.Rendering.setConcurrency(parsedCli.concurrency);
	}
	if (parsedCli.frames) {
		Internals.setFrameRangeFromCli(parsedCli.frames);
	}
	if (parsedCli.png) {
		Log.Warn(
			'The --png flag has been deprecrated. Use --sequence --image-format=png from now on.'
		);
		Config.Output.setImageSequence(true);
		Config.Rendering.setImageFormat('png');
	}
	if (parsedCli.sequence) {
		Config.Output.setImageSequence(true);
	}
	if (typeof parsedCli.crf !== 'undefined') {
		Config.Output.setCrf(parsedCli.crf);
	}
	if (parsedCli.codec) {
		Config.Output.setCodec(parsedCli.codec);
	}
	if (typeof parsedCli.overwrite !== 'undefined') {
		Config.Output.setOverwriteOutput(parsedCli.overwrite);
	}
	if (typeof parsedCli.quality !== 'undefined') {
		Config.Rendering.setQuality(parsedCli.quality);
	}
};
