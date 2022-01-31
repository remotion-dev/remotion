import execa from 'execa';
import {renameSync, unlinkSync} from 'fs';
import {getAudioChannels} from './assets/get-audio-channels';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const addSilentAudioIfNecessary = async ({
	durationInFrames,
	fps,
	outputLocation,
}: {
	outputLocation: string;
	durationInFrames: number;
	fps: number;
}): Promise<void> => {
	const audioChannels = await getAudioChannels(outputLocation);
	if (audioChannels > 0) {
		return;
	}

	const out = outputLocation + '-n';

	await execa('ffmpeg', [
		'-f',
		'lavfi',
		'-i',
		'anullsrc',
		'-i',
		outputLocation,
		'-map',
		'0:a:0',
		'-map',
		'1:v:0',
		'-c:a',
		'pcm_s16le',
		'-c:v',
		'copy',
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		'-y',
		'-t',
		(durationInFrames / fps).toFixed(4),
		'-f',
		'matroska',
		out,
	]);
	unlinkSync(outputLocation);
	renameSync(out, outputLocation);
};
