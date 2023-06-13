import {Internals} from 'remotion';
import {callFf} from './call-ffmpeg';
import type {Codec} from './codec';
import {DEFAULT_CODEC} from './codec';
import {validateQualitySettings} from './crf';
import type {FfmpegOverrideFn} from './ffmpeg-override';
import {getCodecName} from './get-codec-name';
import {getProResProfileName} from './get-prores-profile-name';
import type {VideoImageFormat} from './image-format';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import type {PixelFormat} from './pixel-format';
import {
	DEFAULT_PIXEL_FORMAT,
	validateSelectedPixelFormatAndCodecCombination,
} from './pixel-format';
import type {ProResProfile} from './prores-profile';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';

type PreStitcherOptions = {
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	pixelFormat: PixelFormat | undefined;
	codec: Codec | undefined;
	crf: number | null | undefined;
	onProgress: (progress: number) => void;
	proResProfile: ProResProfile | undefined;
	verbose: boolean;
	imageFormat: VideoImageFormat;
	ffmpegOverride: FfmpegOverrideFn;
	signal: CancelSignal;
	videoBitrate: string | null;
	indent: boolean;
};

export const prespawnFfmpeg = (options: PreStitcherOptions) => {
	Internals.validateDimension(
		options.height,
		'height',
		'passed to `stitchFramesToVideo()`'
	);
	Internals.validateDimension(
		options.width,
		'width',
		'passed to `stitchFramesToVideo()`'
	);
	const codec = options.codec ?? DEFAULT_CODEC;
	Internals.validateFps(
		options.fps,
		'in `stitchFramesToVideo()`',
		codec === 'gif'
	);
	validateEvenDimensionsWithCodec({
		width: options.width,
		height: options.height,
		codec,
		scale: 1,
	});
	const pixelFormat = options.pixelFormat ?? DEFAULT_PIXEL_FORMAT;

	const encoderName = getCodecName(codec);
	const proResProfileName = getProResProfileName(codec, options.proResProfile);

	if (encoderName === null) {
		throw new TypeError('encoderName is null: ' + JSON.stringify(options));
	}

	const supportsCrf = codec !== 'prores';

	Log.verboseAdvanced(
		{
			indent: options.indent,
			logLevel: options.verbose ? 'verbose' : 'info',
			tag: 'prespawnFfmpeg()',
		},
		'encoder',
		encoderName
	);
	Log.verboseAdvanced(
		{
			indent: options.indent,
			logLevel: options.verbose ? 'verbose' : 'info',
			tag: 'prespawnFfmpeg()',
		},
		'pixelFormat',
		pixelFormat
	);
	if (supportsCrf) {
		Log.verboseAdvanced(
			{
				indent: options.indent,
				logLevel: options.verbose ? 'verbose' : 'info',
				tag: 'prespawnFfmpeg()',
			},
			'pixelFormat',
			options.crf
		);
	}

	Log.verboseAdvanced(
		{
			indent: options.indent,
			logLevel: options.verbose ? 'verbose' : 'info',
			tag: 'prespawnFfmpeg()',
		},
		'codec',
		codec
	);
	Log.verboseAdvanced(
		{
			indent: options.indent,
			logLevel: options.verbose ? 'verbose' : 'info',
			tag: 'prespawnFfmpeg()',
		},
		'proResProfileName',
		proResProfileName
	);

	validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const ffmpegArgs = [
		['-r', options.fps.toFixed(2)],
		...[
			['-f', 'image2pipe'],
			['-s', `${options.width}x${options.height}`],
			// If scale is very small (like 0.1), FFMPEG cannot figure out the image
			// format on it's own and we need to hint the format
			['-vcodec', options.imageFormat === 'jpeg' ? 'mjpeg' : 'png'],
			['-i', '-'],
		],
		// -c:v is the same as -vcodec as -codec:video
		// and specified the video codec.
		['-c:v', encoderName],
		proResProfileName ? ['-profile:v', proResProfileName] : null,
		['-pix_fmt', pixelFormat],

		// Without explicitly disabling auto-alt-ref,
		// transparent WebM generation doesn't work
		pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
		...validateQualitySettings({
			crf: options.crf,
			videoBitrate: options.videoBitrate,
			codec,
		}),

		'-y',
		options.outputLocation,
	];

	Log.verboseAdvanced(
		{
			indent: options.indent,
			logLevel: options.verbose ? 'verbose' : 'info',
			tag: 'prespawnFfmpeg()',
		},
		'Generated FFMPEG command:'
	);
	Log.verboseAdvanced(
		{
			indent: options.indent,
			logLevel: options.verbose ? 'verbose' : 'info',
			tag: 'prespawnFfmpeg()',
		},
		ffmpegArgs.join(' ')
	);

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];
	const finalFfmpegString = options.ffmpegOverride
		? options.ffmpegOverride({type: 'pre-stitcher', args: ffmpegString})
		: ffmpegString;

	const task = callFf('ffmpeg', finalFfmpegString);

	options.signal(() => {
		task.kill();
	});

	let ffmpegOutput = '';
	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		ffmpegOutput += str;
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(str);
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	});
	return {task, getLogs: () => ffmpegOutput};
};
