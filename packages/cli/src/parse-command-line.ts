import minimist from 'minimist';
import {Codec, Config, ImageFormat, PixelFormat} from 'remotion';

export type CommandLineOptions = {
	['pixel-format']: PixelFormat;
	['image-format']: ImageFormat;
	concurrency: number;
	overwrite: boolean;
	config: string;
	png: boolean;
	sequence: boolean;
	quality: number;
	force: boolean;
	codec: Codec;
	props: string;
	crf: number;
};

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2));

export const parseCommandLine = () => {
	if (parsedCli['pixel-format']) {
		Config.Output.setPixelFormat(parsedCli['pixel-format']);
	}
	if (parsedCli['image-format']) {
		Config.Rendering.setImageFormat(parsedCli['image-format']);
	}
	if (parsedCli.concurrency) {
		Config.Rendering.setConcurrency(parsedCli.concurrency);
	}
	if (parsedCli.png) {
		console.warn('The --png flag has been renamed to --sequence.');
		Config.Output.setImageSequence(true);
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
