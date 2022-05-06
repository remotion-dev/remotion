import execa from 'execa';

export async function getAudioChannels(path: string) {
	const args = [
		['-v', 'error'],
		['-show_entries', 'stream=channels'],
		['-of', 'default=nw=1'],
		[path],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa('ffprobe', args);
	if (!task.stdout.includes('channels=')) {
		return 0;
	}

	const channels = parseInt(task.stdout.replace('channels=', ''), 10);
	if (isNaN(channels)) {
		throw new TypeError('Unexpected result from ffprobe for channel probing: ');
	}

	return channels;
}
