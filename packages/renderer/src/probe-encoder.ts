import {execFileSync} from 'node:child_process';
import path from 'path';
import type {Codec} from './codec';
import {getExecutablePath} from './compositor/get-executable-path';
import {getExplicitEnv} from './compositor/get-explicit-env';
import {makeFileExecutableIfItIsNot} from './compositor/make-file-executable';
import {getCodecName} from './get-codec-name';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {HardwareAccelerationOption} from './options/hardware-acceleration';

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
}: {
	codec: Codec;
	hardwareAcceleration: HardwareAccelerationOption;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
	crf: unknown;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
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
		logLevel,
		indent,
	});

	// Audio codecs return null, no probing needed
	if (preferred === null) {
		return hardwareAcceleration;
	}

	// Only probe if getCodecName selected a hardware-accelerated encoder
	if (!preferred.hardwareAccelerated) {
		return hardwareAcceleration;
	}

	const encoderAvailable = probeEncoderAvailability({
		encoderName: preferred.encoderName,
		binariesDirectory,
		indent,
		logLevel,
	});

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
	throw new Error(
		`Hardware encoder "${preferred.encoderName}" is not available in your FFmpeg build. ` +
			`Install an FFmpeg with ${preferred.encoderName} support, or use "if-possible" mode instead of "required".`,
	);
};
