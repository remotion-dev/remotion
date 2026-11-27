import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'path';
import type {OnLog} from './browser/BrowserPage';
import type {Codec} from './codec';
import {getExecutablePath} from './compositor/get-executable-path';
import {getExplicitEnv} from './compositor/get-explicit-env';
import {makeFileExecutableIfItIsNot} from './compositor/make-file-executable';
import {
	getCodecName,
	hasSpecifiedUnsupportedHardwareQualifySettings,
} from './get-codec-name';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {HardwareAccelerationOption} from './options/hardware-acceleration';
import type {PixelFormat} from './pixel-format';
import {VAAPI_UPLOAD_FILTER, getVaapiDevice, isVaapiEncoder} from './vaapi';

/**
 * Probes FFmpeg to check if a specific encoder is available.
 * Returns true if the encoder is supported, false otherwise.
 */
export const probeEncoderAvailability = ({
	encoderName,
	binariesDirectory,
	indent,
	logLevel,
}: {
	encoderName: string;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
}): boolean => {
	try {
		const executablePath = getExecutablePath({
			type: 'ffmpeg',
			indent,
			logLevel,
			binariesDirectory,
		});
		makeFileExecutableIfItIsNot(executablePath);

		const cwd = path.dirname(executablePath);
		const result = execFileSync(executablePath, ['-encoders'], {
			encoding: 'utf-8',
			env: getExplicitEnv(cwd),
			stdio: ['pipe', 'pipe', 'pipe'],
			timeout: 10000,
		});

		// FFmpeg -encoders output format: " V..... encoder_name"
		// Escape regex metacharacters and use word-boundary to avoid false positives
		const escaped = encoderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const encoderRegex = new RegExp(`\\b${escaped}\\b`);
		const hasEncoder = encoderRegex.test(result);
		if (!hasEncoder) {
			Log.verbose(
				{indent, logLevel, tag: 'probeEncoderAvailability()'},
				`Encoder "${encoderName}" not found in FFmpeg build. Falling back to software encoding.`,
			);
		}

		return hasEncoder;
	} catch (err) {
		Log.verbose(
			{indent, logLevel, tag: 'probeEncoderAvailability()'},
			`Failed to probe FFmpeg for encoder "${encoderName}": ${err}. Falling back to software encoding.`,
		);
		return false;
	}
};

const vaapiProbeCache = new Map<string, boolean>();

// a VA-API encoder needs a frame of at least this size on every driver
const VAAPI_PROBE_SIZE = 256;

/**
 * Whether the VA-API encoder can start on the configured render node
 * (REMOTION_VAAPI_DEVICE): one frame is encoded to nowhere. That `ffmpeg
 * -encoders` lists `hevc_vaapi` only says it was compiled in; a GPU without
 * that codec's encode profile, or a node this process cannot open, fails here.
 * The answer is kept per FFmpeg, device and encoder.
 */
export const probeVaapiEncoder = ({
	encoderName,
	binariesDirectory,
	indent,
	logLevel,
}: {
	encoderName: string;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
}): boolean => {
	const device = getVaapiDevice();
	if (device === null || !fs.existsSync(device)) {
		Log.verbose(
			{indent, logLevel, tag: 'probeVaapiEncoder()'},
			`The VA-API device "${device}" does not exist.`,
		);
		return false;
	}

	const key = `${binariesDirectory ?? ''}|${device}|${encoderName}`;
	const cached = vaapiProbeCache.get(key);
	if (cached !== undefined) {
		return cached;
	}

	let works = false;
	try {
		const executablePath = getExecutablePath({
			type: 'ffmpeg',
			indent,
			logLevel,
			binariesDirectory,
		});
		makeFileExecutableIfItIsNot(executablePath);
		const cwd = path.dirname(executablePath);
		execFileSync(
			executablePath,
			[
				'-hide_banner',
				'-v',
				'error',
				'-vaapi_device',
				device,
				'-f',
				'rawvideo',
				'-pix_fmt',
				'nv12',
				'-s',
				`${VAAPI_PROBE_SIZE}x${VAAPI_PROBE_SIZE}`,
				'-i',
				'-',
				'-vf',
				VAAPI_UPLOAD_FILTER,
				'-c:v',
				encoderName,
				// an HEVC stream is finished with these two (vaapi-output.ts)
				...(encoderName === 'hevc_vaapi'
					? ['-bsf:v', 'trace_headers,hevc_metadata']
					: []),
				'-frames:v',
				'1',
				'-f',
				'null',
				'-',
			],
			{
				input: new Uint8Array((VAAPI_PROBE_SIZE * VAAPI_PROBE_SIZE * 3) / 2),
				env: getExplicitEnv(cwd),
				stdio: ['pipe', 'pipe', 'pipe'],
				timeout: 10000,
			},
		);
		works = true;
	} catch (err) {
		Log.verbose(
			{indent, logLevel, tag: 'probeVaapiEncoder()'},
			`"${encoderName}" could not start on the VA-API device "${device}": ${err}`,
		);
	}

	vaapiProbeCache.set(key, works);
	return works;
};

/**
 * Resolves the effective hardware acceleration setting by probing FFmpeg
 * for encoder availability. If the preferred hw encoder is not available:
 * - `if-possible` mode: falls back to software encoding
 * - `required` mode: throws a clear error
 */
export const resolveHardwareAcceleration = ({
	codec,
	hardwareAcceleration,
	binariesDirectory,
	indent,
	logLevel,
	crf,
	encodingMaxRate,
	encodingBufferSize,
	proResBitsPerMacroblock,
	onLog,
	pixelFormat = null,
	vaapiRawStream = false,
}: {
	codec: Codec;
	hardwareAcceleration: HardwareAccelerationOption;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
	crf: unknown;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	proResBitsPerMacroblock: number | null;
	onLog: OnLog | null;
	pixelFormat?: PixelFormat | null;
	vaapiRawStream?: boolean;
}): HardwareAccelerationOption => {
	if (hardwareAcceleration === 'disable') {
		return 'disable';
	}

	const preferred = getCodecName({
		codec,
		hardwareAcceleration,
		crf,
		encodingMaxRate,
		encodingBufferSize,
		proResBitsPerMacroblock,
		logLevel,
		indent,
		onLog,
		pixelFormat,
		vaapiRawStream,
	});

	// Audio codecs return null, no probing needed
	if (preferred === null) {
		return hardwareAcceleration;
	}

	// Only probe if getCodecName selected a hardware-accelerated encoder
	if (!preferred.hardwareAccelerated) {
		if (
			hardwareAcceleration === 'if-possible' &&
			hasSpecifiedUnsupportedHardwareQualifySettings({
				crf,
				encodingMaxRate,
				encodingBufferSize,
				proResBitsPerMacroblock,
			})
		) {
			return 'disable';
		}

		return hardwareAcceleration;
	}

	const vaapi = isVaapiEncoder(preferred.encoderName);
	const encoderAvailable =
		probeEncoderAvailability({
			encoderName: preferred.encoderName,
			binariesDirectory,
			indent,
			logLevel,
		}) &&
		(!vaapi ||
			probeVaapiEncoder({
				encoderName: preferred.encoderName,
				binariesDirectory,
				indent,
				logLevel,
			}));

	if (encoderAvailable) {
		return hardwareAcceleration;
	}

	// Encoder not available in FFmpeg
	if (hardwareAcceleration === 'if-possible') {
		Log.verbose(
			{indent, logLevel, tag: 'resolveHardwareAcceleration()'},
			`Hardware encoder "${preferred.encoderName}" not available. Falling back to software encoding.`,
		);
		return 'disable';
	}

	// hardwareAcceleration === 'required'
	if (vaapi) {
		throw new Error(
			`Hardware encoder "${preferred.encoderName}" could not start on the VA-API device "${getVaapiDevice()}". ` +
				`Check that the device exists and is readable, that the GPU can encode ${codec} and that your FFmpeg is built with VA-API, or use "if-possible" mode instead of "required".`,
		);
	}

	throw new Error(
		`Hardware encoder "${preferred.encoderName}" is not available in your FFmpeg build. ` +
			`Install an FFmpeg with ${preferred.encoderName} support, or use "if-possible" mode instead of "required".`,
	);
};
