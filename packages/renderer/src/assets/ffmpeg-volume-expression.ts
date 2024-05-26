// Example is here https://ffmpeg.org/ffmpeg-filters.html#volume
// Allowed syntax is here: https://ffmpeg.org/ffmpeg-utils.html#Expression-Evaluation

// If once, ffmpeg evaluates volume expression once.
// If frame, it evaluates it for each frame
import {roundVolumeToAvoidStackOverflow} from './round-volume-to-avoid-stack-overflow';
import type {AssetVolume} from './types';

type FfmpegEval = 'once' | 'frame';

type VolumeArray = [number, number[]][];

// In FFMPEG expressions, the current time is represented by 't'
// the `n` for the timestamp variable is buggy
const FFMPEG_TIME_VARIABLE = 't';

const ffmpegIfOrElse = (condition: string, then: string, elseDo: string) => {
	return `if(${condition},${then},${elseDo})`;
};

const ffmpegIsOneOfFrames = ({
	frames,
	trimLeft,
	fps,
}: {
	frames: number[];
	trimLeft: number;
	fps: number;
}) => {
	const consecutiveArrays: number[][] = [];
	for (let i = 0; i < frames.length; i++) {
		const previousFrame = frames[i - 1];
		const frame = frames[i];
		if (previousFrame === undefined || frame !== previousFrame + 1) {
			consecutiveArrays.push([]);
		}

		consecutiveArrays[consecutiveArrays.length - 1].push(frame);
	}

	return consecutiveArrays
		.map((f) => {
			const firstFrame = f[0];
			const lastFrame = f[f.length - 1];
			const before = (firstFrame - 0.5) / fps;
			const after = (lastFrame + 0.5) / fps;
			return `between(${FFMPEG_TIME_VARIABLE},${(before + trimLeft).toFixed(
				4,
			)},${(after + trimLeft).toFixed(4)})`;
		})
		.join('+');
};

const ffmpegBuildVolumeExpression = ({
	arr,
	delay,
	fps,
}: {
	arr: VolumeArray;
	delay: number;
	fps: number;
}): string => {
	if (arr.length === 0) {
		throw new Error('Volume array expression should never have length 0');
	}

	if (arr.length === 1) {
		return String(arr[0][0]);
	}

	const [first, ...rest] = arr;
	const [volume, frames] = first;

	return ffmpegIfOrElse(
		ffmpegIsOneOfFrames({frames, trimLeft: delay, fps}),
		String(volume),
		ffmpegBuildVolumeExpression({arr: rest, delay, fps}),
	);
};

type FfmpegVolumeExpression = {
	eval: FfmpegEval;
	value: string;
};

export const ffmpegVolumeExpression = ({
	volume,
	fps,
	trimLeft,
	allowAmplificationDuringRender,
}: {
	volume: AssetVolume;
	trimLeft: number;
	fps: number;
	allowAmplificationDuringRender: boolean;
}): FfmpegVolumeExpression => {
	const maxVolume = allowAmplificationDuringRender ? Infinity : 1;
	// If it's a static volume, we return it and tell
	// FFMPEG it only has to evaluate it once
	if (typeof volume === 'number') {
		return {
			eval: 'once',
			value: String(Math.min(maxVolume, volume)),
		};
	}

	if ([...new Set(volume)].length === 1) {
		return ffmpegVolumeExpression({
			volume: volume[0],
			fps,
			trimLeft,
			allowAmplificationDuringRender,
		});
	}

	// A 1 sec video with frames 0-29 would mean that
	// frame 29 corresponds to timestamp 0.966666...
	// but the audio is actually 1 sec long. For that reason we pad the last
	// timestamp.
	const paddedVolume = [...volume, volume[volume.length - 1]];

	// Otherwise, we construct an FFMPEG expression. First step:
	// Make a map of all possible volumes
	// {possibleVolume1} => [frame1, frame2]
	// {possibleVolume2} => [frame3, frame4]
	const volumeMap: {[volume: string]: number[]} = {};
	paddedVolume.forEach((baseVolume, frame) => {
		// Adjust volume based on how many other tracks have not yet finished
		const actualVolume = roundVolumeToAvoidStackOverflow(
			Math.min(maxVolume, baseVolume),
		);
		if (!volumeMap[actualVolume]) {
			volumeMap[actualVolume] = [];
		}

		volumeMap[actualVolume].push(frame);
	});

	// Sort the map so that the most common volume is last
	// this is going to be the else statement so the expression is short
	const volumeArray: VolumeArray = Object.keys(volumeMap)
		.map((key): [number, number[]] => [Number(key), volumeMap[key]])
		.sort((a, b) => a[1].length - b[1].length);

	// Construct and tell FFMPEG it has to evaluate expression on each frame
	const expression = ffmpegBuildVolumeExpression({
		arr: volumeArray,
		delay: trimLeft,
		fps,
	});

	return {
		eval: 'frame',
		value: `'${expression}'`,
	};
};
