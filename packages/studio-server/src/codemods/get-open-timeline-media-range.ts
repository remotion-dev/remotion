import {statSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';

type MediaRange = {
	OTIO_SCHEMA: 'TimeRange.1';
	start_time: {OTIO_SCHEMA: 'RationalTime.1'; value: number; rate: number};
	duration: {OTIO_SCHEMA: 'RationalTime.1'; value: number; rate: number};
};

const cache = new Map<string, Promise<MediaRange>>();

export const getOpenTimelineMediaRange = ({
	src,
	kind,
	binariesDirectory,
}: {
	src: string;
	kind: 'video' | 'audio';
	binariesDirectory: string | null;
}): Promise<MediaRange> => {
	const stat = statSync(src);
	const key = JSON.stringify([
		src,
		kind,
		stat.size,
		stat.mtimeMs,
		binariesDirectory,
	]);
	const cached = cache.get(key);
	if (cached) return cached;
	const result = (async (): Promise<MediaRange> => {
		const {stdout} = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [
				'-v',
				'error',
				'-show_entries',
				'stream=codec_type,duration_ts,time_base,nb_frames,avg_frame_rate,r_frame_rate:stream_tags=timecode:format=duration:format_tags=timecode',
				'-of',
				'json',
				src,
			],
			indent: false,
			logLevel: 'error',
			binariesDirectory,
			cancelSignal: undefined,
		});
		const metadata = JSON.parse(stdout) as {
			streams: {
				codec_type: string;
				duration_ts?: number;
				nb_frames?: string;
				time_base?: string;
				avg_frame_rate?: string;
				r_frame_rate?: string;
				tags?: {timecode?: string};
			}[];
			format?: {duration?: string; tags?: {timecode?: string}};
		};
		const stream = metadata.streams.find((entry) => entry.codec_type === kind);
		if (!stream) throw new Error(`No ${kind} stream found in ${src}`);
		const frameRate = [stream.avg_frame_rate, stream.r_frame_rate]
			.map((rate) => {
				const [numerator, denominator] = (rate ?? '').split('/').map(Number);
				return numerator / denominator;
			})
			.find((rate) => Number.isFinite(rate) && rate > 0);
		const frameCount = Number(stream.nb_frames);
		const [timeBaseNumerator, timeBaseDenominator] = (stream.time_base ?? '')
			.split('/')
			.map(Number);
		const ticks = stream.duration_ts;
		const duration =
			kind === 'video' &&
			Number.isSafeInteger(frameCount) &&
			frameCount > 0 &&
			frameRate !== undefined
				? {value: frameCount, rate: frameRate}
				: ticks !== undefined &&
					  Number.isSafeInteger(ticks) &&
					  Number.isSafeInteger(ticks * timeBaseNumerator) &&
					  timeBaseNumerator > 0 &&
					  timeBaseDenominator > 0
					? {value: ticks * timeBaseNumerator, rate: timeBaseDenominator}
					: {value: Number(metadata.format?.duration), rate: 1};
		if (!Number.isFinite(duration.value) || duration.value <= 0) {
			throw new Error(`Cannot determine the media duration of ${src}`);
		}

		let startTime = {value: 0, rate: 1};
		const timecode =
			kind === 'video'
				? (stream.tags?.timecode ??
					metadata.format?.tags?.timecode ??
					metadata.streams.find((entry) => entry.tags?.timecode)?.tags
						?.timecode)
				: null;
		if (timecode) {
			const match = /^(\d{2,}):([0-5]\d):([0-5]\d)([:;])(\d{2,3})$/.exec(
				timecode,
			);
			if (!match || frameRate === undefined) {
				throw new Error(
					`Cannot interpret media timecode ${timecode} in ${src}`,
				);
			}

			const [, hours, minutes, seconds, separator, frames] = match;
			const nominalRate = Math.round(frameRate);
			const totalMinutes = Number(hours) * 60 + Number(minutes);
			let value =
				(totalMinutes * 60 + Number(seconds)) * nominalRate + Number(frames);
			if (Number(frames) >= nominalRate) {
				throw new Error(`Invalid media timecode ${timecode} in ${src}`);
			}

			if (separator === ';') {
				const dropFrames = nominalRate / 15;
				if (
					!Number.isInteger(dropFrames) ||
					Math.abs(frameRate - (nominalRate * 1000) / 1001) > 1e-6 ||
					(Number(minutes) % 10 !== 0 &&
						Number(seconds) === 0 &&
						Number(frames) < dropFrames)
				) {
					throw new Error(`Invalid drop-frame timecode ${timecode} in ${src}`);
				}

				value -= dropFrames * (totalMinutes - Math.floor(totalMinutes / 10));
			}

			startTime = {value, rate: frameRate};
		}

		return {
			OTIO_SCHEMA: 'TimeRange.1',
			start_time: {OTIO_SCHEMA: 'RationalTime.1', ...startTime},
			duration: {OTIO_SCHEMA: 'RationalTime.1', ...duration},
		};
	})();
	cache.set(key, result);
	if (cache.size > 256) cache.delete(cache.keys().next().value!);
	result.catch(() => cache.delete(key));
	return result;
};
