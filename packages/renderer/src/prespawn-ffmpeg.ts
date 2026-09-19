import type {Readable, Writable} from 'node:stream';
import type {_InternalTypes} from 'remotion';
import type {OnLog} from './browser/BrowserPage';
import {callFf} from './call-ffmpeg';
import type {HardwareAccelerationOption} from './client';
import type {Codec} from './codec';
import {DEFAULT_CODEC} from './codec';
import {generateFfmpegArgs} from './ffmpeg-args';
import type {FfmpegOverrideFn} from './ffmpeg-override';
import {getProResProfileName} from './get-prores-profile-name';
import type {VideoImageFormat} from './image-format';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import type {ColorSpace} from './options/color-space';
import type {X264Preset} from './options/x264-preset';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import type {PixelFormat} from './pixel-format';
import {
	DEFAULT_PIXEL_FORMAT,
	validateSelectedPixelFormatAndCodecCombination,
} from './pixel-format';
import {resolveHardwareAcceleration} from './probe-encoder';
import type {RemotionRawFrame} from './remotion-shared-memory';
import {createRemotionSharedMemoryFfmpegBridge} from './remotion-shared-memory-ffmpeg';
import {validateDimension, validateFps} from './validate';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {writeWithBackpressure} from './write-with-backpressure';

type RunningStatus =
	| {
			type: 'running';
	  }
	| {
			type: 'quit-successfully';
			stderr: string;
	  }
	| {
			type: 'quit-with-error';
			exitCode: number;
			signal: NodeJS.Signals | null;
			stderr: string;
	  };

type PreStitcherOptions = {
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	pixelFormat: PixelFormat | undefined;
	codec: Codec | undefined;
	crf: number | null | undefined;
	x264Preset: X264Preset | null;
	gopSize: number | null;
	onProgress: (progress: number) => void;
	proResProfile: _InternalTypes['ProResProfile'] | undefined;
	logLevel: LogLevel;
	imageFormat: VideoImageFormat;
	ffmpegOverride: FfmpegOverrideFn;
	signal: CancelSignal;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	indent: boolean;
	colorSpace: ColorSpace | null;
	binariesDirectory: string | null;
	hardwareAcceleration: HardwareAccelerationOption;
	onLog: OnLog;
	inputMode: 'encoded-image' | 'remotion-shared-memory';
};

const remotionSharedMemorySupport = new Map<string, Promise<boolean>>();

export const ffmpegSupportsRemotionSharedMemory = ({
	binariesDirectory,
	indent,
	logLevel,
}: {
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
}) => {
	const key = binariesDirectory ?? '<bundled>';
	const cached = remotionSharedMemorySupport.get(key);
	if (cached) {
		return cached;
	}

	const result = (async () => {
		try {
			const task = callFf({
				bin: 'ffmpeg',
				args: ['-hide_banner', '-devices'],
				indent,
				logLevel,
				binariesDirectory,
				cancelSignal: undefined,
			});
			const output = await task;
			return /(?:^|\n)\s*D\s{2}remotionshm(?:\s|$)/.test(
				`${output.stdout}\n${output.stderr}`,
			);
		} catch {
			return false;
		}
	})();
	remotionSharedMemorySupport.set(key, result);
	return result;
};

const fpsAsFraction = (fps: number) => {
	const denominator = 1_000_000;
	let numerator = Math.round(fps * denominator);
	let divisor = denominator;
	let left = numerator;
	let right = divisor;
	while (right !== 0) {
		const remainder = left % right;
		left = right;
		right = remainder;
	}

	numerator /= left;
	divisor /= left;
	return `${numerator}/${divisor}`;
};

export const prespawnFfmpeg = (options: PreStitcherOptions) => {
	validateDimension(
		options.height,
		'height',
		'passed to `stitchFramesToVideo()`',
	);
	validateDimension(
		options.width,
		'width',
		'passed to `stitchFramesToVideo()`',
	);
	const codec = options.codec ?? DEFAULT_CODEC;
	validateFps(options.fps, 'in `stitchFramesToVideo()`', codec === 'gif');
	validateEvenDimensionsWithCodec({
		width: options.width,
		height: options.height,
		codec,
		scale: 1,
		wantsImageSequence: false,
		indent: options.indent,
		logLevel: options.logLevel,
	});
	const pixelFormat = options.pixelFormat ?? DEFAULT_PIXEL_FORMAT;

	const proResProfileName = getProResProfileName(codec, options.proResProfile);

	validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const resolvedHardwareAcceleration = resolveHardwareAcceleration({
		codec,
		hardwareAcceleration: options.hardwareAcceleration,
		binariesDirectory: options.binariesDirectory,
		indent: options.indent,
		logLevel: options.logLevel,
		crf: options.crf,
		encodingMaxRate: options.encodingMaxRate,
		encodingBufferSize: options.encodingBufferSize,
		onLog: options.onLog,
	});

	const encodingArgs = generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName,
		pixelFormat,
		x264Preset: options.x264Preset,
		gopSize: options.gopSize,
		codec,
		crf: options.crf,
		videoBitrate: options.videoBitrate,
		encodingMaxRate: options.encodingMaxRate,
		encodingBufferSize: options.encodingBufferSize,
		colorSpace: options.colorSpace,
		hardwareAcceleration: resolvedHardwareAcceleration,
		indent: options.indent,
		logLevel: options.logLevel,
	});
	const encodingArgsWithOwnedPixels =
		options.inputMode === 'remotion-shared-memory'
			? encodingArgs.some(([flag]) => flag === '-vf')
				? encodingArgs.map((args) =>
						args[0] === '-vf' ? ['-vf', `copy,${args[1]}`] : args,
					)
				: [...encodingArgs, ['-vf', 'copy']]
			: encodingArgs;

	const ffmpegArgs = [
		...(options.inputMode === 'remotion-shared-memory'
			? [
					['-nostdin'],
					['-xerror'],
					['-nofind_stream_info'],
					['-threads:v', '1'],
					['-f', 'remotionshm'],
					['-video_size', `${options.width}x${options.height}`],
					['-framerate', fpsAsFraction(options.fps)],
					['-control_fd', '3'],
					['-ack_fd', '4'],
					['-i', 'remotion'],
				]
			: [
					['-r', options.fps],
					['-f', 'image2pipe'],
					['-s', `${options.width}x${options.height}`],
					// If scale is very small (like 0.1), FFMPEG cannot figure out the image
					// format on its own and we need to hint the format.
					['-vcodec', options.imageFormat === 'jpeg' ? 'mjpeg' : 'png'],
					['-i', '-'],
				]),
		...encodingArgsWithOwnedPixels,
		options.inputMode === 'remotion-shared-memory'
			? ['-fps_mode', 'passthrough']
			: null,

		'-y',
		options.outputLocation,
	];

	Log.verbose(
		{
			indent: options.indent,
			logLevel: options.logLevel,
			tag: 'prespawnFfmpeg()',
		},
		'Generated FFMPEG command:',
	);
	Log.verbose(
		{
			indent: options.indent,
			logLevel: options.logLevel,
			tag: 'prespawnFfmpeg()',
		},
		ffmpegArgs.join(' '),
	);

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];
	const finalFfmpegString = options.ffmpegOverride
		? options.ffmpegOverride({type: 'pre-stitcher', args: ffmpegString})
		: ffmpegString;

	const task = callFf({
		bin: 'ffmpeg',
		args: finalFfmpegString,
		indent: options.indent,
		logLevel: options.logLevel,
		binariesDirectory: options.binariesDirectory,
		cancelSignal: options.signal,
		options:
			options.inputMode === 'remotion-shared-memory'
				? {stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe']}
				: undefined,
	});
	const remotionSharedMemory =
		options.inputMode === 'remotion-shared-memory'
			? createRemotionSharedMemoryFfmpegBridge({
					control: task.stdio[3] as Writable,
					acknowledgements: task.stdio[4] as Readable,
				})
			: null;

	let ffmpegOutput = '';
	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		ffmpegOutput += str;
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(str, options.fps);
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	});

	let exitCode: RunningStatus = {
		type: 'running',
	};

	task.on('exit', (code, signal) => {
		if ((typeof code === 'number' && code > 0) || signal) {
			exitCode = {
				type: 'quit-with-error',
				exitCode: code ?? 1,
				signal: signal ?? null,
				stderr: ffmpegOutput,
			};
		} else {
			exitCode = {
				type: 'quit-successfully',
				stderr: ffmpegOutput,
			};
		}
	});

	return {
		task,
		getLogs: () => ffmpegOutput,
		getExitStatus: () => exitCode,
		writeFrame: async ({
			frame,
			pts,
		}: {
			frame: Buffer | RemotionRawFrame;
			pts: number;
		}) => {
			if (remotionSharedMemory) {
				if (Buffer.isBuffer(frame)) {
					throw new Error('Expected a Remotion shared-memory frame.');
				}

				return remotionSharedMemory.writeFrame({frame, pts});
			}

			if (!Buffer.isBuffer(frame)) {
				throw new Error('Expected an encoded image frame.');
			}

			if (!task.stdin) {
				throw new Error('FFmpeg stdin is not available.');
			}

			await writeWithBackpressure({data: frame, writable: task.stdin});
			return {waitForAck: Promise.resolve()};
		},
		finishInput: async () => {
			if (remotionSharedMemory) {
				await remotionSharedMemory.finish();
				return;
			}

			task.stdin?.end();
		},
		abortInput: (error: Error) => {
			remotionSharedMemory?.fail(error);
		},
	};
};
