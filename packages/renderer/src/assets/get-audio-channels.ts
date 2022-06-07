import execa from 'execa';
import {FfmpegExecutable} from 'remotion';

export async function getAudioChannelsAndDuration(
	path: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<{
	channels: number;
	duration: number | null;
}> {
	const args = [
		['-v', 'error'],
		['-show_entries', 'stream=channels:format=duration'],
		['-of', 'default=nw=1'],
		[path],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa(ffprobeExecutable ?? 'ffprobe', args);

	const channels = task.stdout.match(/channels=([0-9]+)/);
	const duration = task.stdout.match(/duration=([0-9.]+)/);

	return {
		channels: channels ? parseInt(channels[1], 10) : 0,
		duration: duration ? parseFloat(duration[1]) : null,
	};
}
