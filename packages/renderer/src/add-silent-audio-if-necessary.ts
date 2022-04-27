import execa from 'execa';
import {renameSync, unlinkSync} from 'fs';
import {Codec} from 'remotion';
import {getAudioChannels} from './assets/get-audio-channels';
import {getAudioCodecName} from './get-audio-codec-name';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const addSilentAudioIfNecessary = async ({
	durationInFrames,
	fps,
	outputLocation,
	chunkCodec,
}: {
	outputLocation: string;
	durationInFrames: number;
	fps: number;
	chunkCodec: Codec;
}): Promise<void> => {
	const audioChannels = await getAudioChannels(outputLocation);
	if (audioChannels > 0) {
		return;
	}

	const out = outputLocation + '-n';

	const audioCodec = getAudioCodecName(chunkCodec);

	const isVp8 = chunkCodec === 'vp8' || chunkCodec === 'vp9';

	if (!audioCodec) {
		throw new Error('expected audio codec');
	}

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
		audioCodec,
		'-c:v',
		'copy',
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		'-y',
		'-t',
		(durationInFrames / fps).toFixed(4),
		'-f',
		isVp8 ? 'webm' : 'matroska',
		out,
	]);
	unlinkSync(outputLocation);
	renameSync(out, outputLocation);
};
