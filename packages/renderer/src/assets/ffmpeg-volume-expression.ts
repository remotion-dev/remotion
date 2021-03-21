// Example is here https://ffmpeg.org/ffmpeg-filters.html#volume
// Allowed syntax is here: https://ffmpeg.org/ffmpeg-utils.html#Expression-Evaluation

// If once, ffmpeg evaluates volume expression once.
// If frame, it evaluates it for each frame
import {AssetVolume} from './types';

type FfmpegEval = 'once' | 'frame';

type VolumeArray = [number, number[]][];

// In FFMPEG expressions, the current frame is represented by 'n'
const FFMPEG_FRAME_VARIABLE = 'n';

const ffmpegIfOrElse = (condition: string, then: string, elseDo: string) => {
	return `if(${condition},${then},${elseDo})`;
};

const ffmpegIsOneOfFrames = (frames: number[]) => {
	return frames
		.map((f) => {
			return `eq(${FFMPEG_FRAME_VARIABLE},${f})`;
		})
		.join('+');
};

const ffmpegBuildVolumeExpression = (arr: VolumeArray): string => {
	if (arr.length === 0) {
		throw new Error('Volume array expression should never have length 0');
	}
	if (arr.length === 1) {
		return String(arr[0][0]);
	}
	const [first, ...rest] = arr;
	const [volume, frames] = first;
	return ffmpegIfOrElse(
		ffmpegIsOneOfFrames(frames),
		String(volume),
		ffmpegBuildVolumeExpression(rest)
	);
};

type FfmpegVolumeExpression = {
	eval: FfmpegEval;
	value: string;
};

export const ffmpegVolumeExpression = (
	volume: AssetVolume,
	multiplier: number
): FfmpegVolumeExpression => {
	if (typeof volume === 'number') {
		return {
			eval: 'once',
			value: String(volume * multiplier),
		};
	}

	// Make a map of all possible volumes
	const volumeMap: {[volume: string]: number[]} = {};
	volume.forEach((baseVolume, frame) => {
		const actualVolume = baseVolume * multiplier;
		if (!volumeMap[actualVolume]) {
			volumeMap[actualVolume] = [];
		}
		volumeMap[actualVolume].push(frame);
	});

	// Sort the map so that the most common volume is last, this is going to be the else statement
	const volumeArray: VolumeArray = Object.keys(volumeMap)
		.map((key): [number, number[]] => [Number(key), volumeMap[key]])
		.sort((a, b) => a[1].length - b[1].length);

	const expression = ffmpegBuildVolumeExpression(volumeArray);
	return {
		eval: 'frame',
		value: `'${expression}'`,
	};
};
