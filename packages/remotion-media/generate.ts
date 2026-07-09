import {copyFileSync, existsSync, mkdirSync} from 'fs';
import path from 'path';
import {$} from 'bun';

const audioCodecs = [
	'aac',
	'flac',
	'mp3',
	'opus',
	'vorbis',
	'pcm',
	'none',
] as const;

const videoCodecs = ['h264', 'h265', 'vp8', 'vp9', 'prores', 'none'] as const;
const containers = ['mp4', 'wav', 'mp3', 'flac', 'webm', 'mkv', 'mov'] as const;
const categories = [
	'codecs',
	'dimensions',
	'durations',
	'fps',
	'audio',
	'sample-rates',
	'greenscreen',
	'edge-cases',
	'sound-effects',
	'hls',
] as const;

type Container = (typeof containers)[number];
type VideoCodec = (typeof videoCodecs)[number];
type AudioCodec = (typeof audioCodecs)[number];
type Category = (typeof categories)[number];

type VideoVariant = {
	videoCodec: VideoCodec;
	audioCodec: AudioCodec;
	container: Container | 'm3u8';
	fileNames: string[];
	size: number;
	category: Category;
	attribution?: string;
};

const outDir = 'files';

const canFitAudioCodecInContainer: {
	[key in Container]: {[key in AudioCodec]: boolean};
} = {
	mp4: {
		aac: true,
		flac: true,
		mp3: true,
		opus: false,
		vorbis: false,
		pcm: true,
		none: true,
	},
	wav: {
		aac: false,
		flac: false,
		mp3: false,
		opus: false,
		vorbis: false,
		pcm: true,
		none: false,
	},
	flac: {
		aac: false,
		flac: true,
		mp3: false,
		opus: false,
		vorbis: false,
		pcm: false,
		none: false,
	},
	webm: {
		aac: false,
		flac: false,
		mp3: false,
		opus: true,
		vorbis: true,
		pcm: false,
		none: true,
	},
	mp3: {
		aac: false,
		flac: false,
		mp3: true,
		opus: false,
		vorbis: false,
		pcm: false,
		none: false,
	},
	mkv: {
		aac: true,
		flac: true,
		mp3: true,
		opus: true,
		vorbis: true,
		pcm: false,
		none: true,
	},
	mov: {
		aac: true,
		flac: false,
		mp3: false,
		opus: false,
		vorbis: false,
		pcm: true,
		none: true,
	},
};

const canFitVideoCodecInContainer: {
	[key in Container]: {[key in VideoCodec]: boolean};
} = {
	mp4: {
		h264: true,
		h265: true,
		vp8: false,
		vp9: false,
		prores: false,
		none: false,
	},
	wav: {
		h264: false,
		h265: false,
		vp8: false,
		vp9: false,
		prores: false,
		none: true,
	},
	flac: {
		h264: false,
		h265: false,
		vp8: false,
		vp9: false,
		prores: false,
		none: true,
	},
	webm: {
		h264: false,
		h265: false,
		vp8: true,
		vp9: true,
		prores: false,
		none: false,
	},
	mp3: {
		h264: false,
		h265: false,
		vp8: false,
		vp9: false,
		prores: false,
		none: true,
	},
	mkv: {
		h264: true,
		h265: true,
		vp8: true,
		vp9: true,
		prores: true,
		none: false,
	},
	mov: {
		h264: true,
		h265: true,
		vp8: false,
		vp9: false,
		prores: true,
		none: false,
	},
};

const defaultVideoCodec: {[key in Container]: VideoCodec | null} = {
	mp4: 'h264',
	wav: null,
	flac: null,
	webm: 'vp8',
	mp3: null,
	mkv: 'h264',
	mov: 'h264',
};

const defaultAudioCodec: {[key in Container]: AudioCodec | null} = {
	mp4: 'aac',
	wav: 'pcm',
	flac: 'flac',
	webm: null,
	mp3: 'mp3',
	mkv: 'aac',
	mov: 'aac',
};

const isVideoContainer: {[key in Container]: boolean} = {
	mp4: true,
	wav: false,
	flac: false,
	webm: true,
	mp3: false,
	mkv: true,
	mov: true,
};

const videoEncoders: {
	[key in VideoCodec]: string | null;
} = {
	h264: 'libx264',
	h265: 'libx265',
	vp8: 'libvpx',
	vp9: 'libvpx-vp9',
	prores: 'prores_ks',
	none: null,
};

const audioEncoders: {
	[key in AudioCodec]: string | null;
} = {
	aac: 'aac',
	flac: 'flac',
	mp3: 'mp3',
	opus: 'libopus',
	vorbis: 'libvorbis',
	pcm: 'pcm_s16le',
	none: null,
};

const extensions: {
	[key in Container]: string;
} = {
	flac: 'flac',
	mp3: 'mp3',
	mp4: 'mp4',
	mkv: 'mkv',
	webm: 'webm',
	wav: 'wav',
	mov: 'mov',
};

const getOutputName = ({
	container,
	videoCodec,
	audioCodec,
	abbreviateDefaultVideoCodec,
	abbreviateDefaultAudioCodec,
}: {
	container: Container;
	videoCodec: VideoCodec;
	audioCodec: AudioCodec;
	abbreviateDefaultVideoCodec: boolean;
	abbreviateDefaultAudioCodec: boolean;
}) => {
	const isDefaultVideoCodec = defaultVideoCodec[container] === videoCodec;
	const isDefaultAudioCodec = defaultAudioCodec[container] === audioCodec;

	return [
		[
			isVideoContainer[container] ? 'video' : 'audio',
			isDefaultVideoCodec && abbreviateDefaultVideoCodec
				? null
				: isVideoContainer[container]
					? videoCodec
					: null,
			isDefaultAudioCodec && abbreviateDefaultAudioCodec ? null : audioCodec,
		]
			.filter(Boolean)
			.join('-'),
		extensions[container],
	].join('.');
};

const tonePath = 'tone.wav';

const base8k = path.join('out', '8k.mp4');
const baseMute = path.join('out', 'mute.mp4');

const generateCodecVariant = async ({
	outputPath,
	videoEncoder,
	audioEncoder,
}: {
	outputPath: string;
	videoEncoder: string | null;
	audioEncoder: string | null;
}) => {
	if (videoEncoder && audioEncoder) {
		await $`ffmpeg -i ${baseMute} -i ${tonePath} -t 10 -c:v ${videoEncoder} -c:a ${audioEncoder} ${outputPath} -y`;
		return;
	}

	if (videoEncoder && !audioEncoder) {
		await $`ffmpeg -i ${baseMute} -t 10 -c:v ${videoEncoder} -an ${outputPath} -y`;
		return;
	}

	if (!videoEncoder && audioEncoder) {
		await $`ffmpeg -i ${tonePath} -t 10 -vn -c:a ${audioEncoder} ${outputPath} -y`;
		return;
	}

	throw new Error(`No encoders for ${outputPath}`);
};

if (!(await Bun.file(base8k).exists())) {
	await $`bunx remotion render src/compositions/index.ts Base ${base8k} --frames=0-599 --scale=4 --muted`;
}

if (!(await Bun.file(baseMute).exists())) {
	await $`bunx remotion render src/compositions/index.ts Base ${baseMute} --muted`;
}

const variants: VideoVariant[] = [];

for (const container of containers) {
	for (const videoCodec of videoCodecs) {
		for (const audioCodec of audioCodecs) {
			if (!canFitAudioCodecInContainer[container][audioCodec]) {
				continue;
			}

			if (!canFitVideoCodecInContainer[container][videoCodec]) {
				continue;
			}

			const [outputName, ...alternativeNames] = [
				...new Set([
					getOutputName({
						container,
						videoCodec,
						audioCodec,
						abbreviateDefaultAudioCodec: true,
						abbreviateDefaultVideoCodec: true,
					}),
					getOutputName({
						container,
						videoCodec,
						audioCodec,
						abbreviateDefaultAudioCodec: true,
						abbreviateDefaultVideoCodec: false,
					}),
					getOutputName({
						container,
						videoCodec,
						audioCodec,
						abbreviateDefaultAudioCodec: false,
						abbreviateDefaultVideoCodec: true,
					}),
					getOutputName({
						container,
						videoCodec,
						audioCodec,
						abbreviateDefaultAudioCodec: false,
						abbreviateDefaultVideoCodec: false,
					}),
				]),
			];

			if (!existsSync(outDir)) {
				mkdirSync(outDir, {recursive: true});
			}

			if (!(await Bun.file(path.join(outDir, outputName)).exists())) {
				console.log(`Generating ${outputName}`);

				const videoEncoder = videoEncoders[videoCodec];
				const audioEncoder = audioEncoders[audioCodec];

				await generateCodecVariant({
					outputPath: path.join(outDir, outputName),
					videoEncoder,
					audioEncoder,
				});
			}

			for (const alternativeName of alternativeNames) {
				copyFileSync(
					path.join(outDir, outputName),
					path.join(outDir, alternativeName),
				);
			}

			const size = await Bun.file(path.join(outDir, outputName)).stat();

			const videoVariant: VideoVariant = {
				videoCodec,
				audioCodec,
				container,
				fileNames: [outputName, ...alternativeNames],
				size: size.size,
				category: 'codecs',
			};
			variants.push(videoVariant);
		}
	}
}

// Generate additional size variants (16:9) from out/8k.mp4 using H.264/AAC MP4
const sizePresets = [
	{width: 640, height: 360, label: '360p'},
	{width: 854, height: 480, label: '480p'},
	{width: 1280, height: 720, label: '720p'},
	{width: 1920, height: 1080, label: '1080p'},
	{width: 2560, height: 1440, label: '1440p'},
	{width: 3840, height: 2160, label: '2160p'},
] as const;

for (const preset of sizePresets) {
	const outputName = `video-${preset.label}.mp4`;
	const targetPath = path.join(outDir, outputName);

	if (!(await Bun.file(targetPath).exists())) {
		console.log(`Generating ${outputName} from ${base8k}`);
		await $`ffmpeg -i ${base8k} -i tone.wav -vf scale=${preset.width}:${preset.height} -c:v libx264 -c:a aac ${targetPath} -y`;
	}

	const stat = await Bun.file(targetPath).stat();
	const videoVariant: VideoVariant = {
		videoCodec: 'h264',
		audioCodec: 'aac',
		container: 'mp4',
		fileNames: [outputName],
		size: stat.size,
		category: 'dimensions',
	};
	variants.push(videoVariant);
}

// Generate duration variants (use BaseMute as the video reference), H.264/AAC MP4
const durationBaseVideoPath = 'out/mute.mp4';
const durationPresets = [
	{seconds: 5, label: '5s'},
	{seconds: 10, label: '10s'},
	{seconds: 30, label: '30s'},
	{seconds: 60, label: '1m'},
	{seconds: 60 * 5, label: '5m'},
	{seconds: 60 * 10, label: '10m'},
	{seconds: 60 * 30, label: '30m'},
] as const;

for (const preset of durationPresets) {
	const outputName = `video-${preset.label}.mp4`;
	const targetPath = path.join(outDir, outputName);

	if (!(await Bun.file(targetPath).exists())) {
		console.log(`Generating ${outputName} from ${durationBaseVideoPath}`);
		await $`ffmpeg -i ${durationBaseVideoPath} -i tone.wav -t ${preset.seconds} -c:v copy -c:a aac ${targetPath} -y`;
	}

	const stat = await Bun.file(targetPath).stat();
	const videoVariant: VideoVariant = {
		videoCodec: 'h264',
		audioCodec: 'aac',
		container: 'mp4',
		fileNames: [outputName],
		size: stat.size,
		category: 'durations',
	};
	variants.push(videoVariant);
}

const fpsPresets = [
	{fps: 24, label: '24fps'},
	{fps: 25, label: '25fps'},
	{fps: 29.97, label: '29.97fps'},
	{fps: 30, label: '30fps'},
	{fps: 59.94, label: '59.94fps'},
	{fps: 60, label: '60fps'},
	{fps: 120, label: '120fps'},
	{fps: 240, label: '240fps'},
] as const;

for (const preset of fpsPresets) {
	const outputName = `video-${preset.label}.mp4`;
	const targetPath = path.join(outDir, outputName);

	if (!(await Bun.file(targetPath).exists())) {
		console.log(`Generating ${outputName}`);
		const intermediate = path.join('out', `${preset.label}.mp4`);
		if (!(await Bun.file(intermediate).exists())) {
			await $`bunx remotion render src/compositions/index.ts Base  --props="{\"fps\": ${
				preset.fps
			}}" --frames=0-${Math.round(
				preset.fps * 10 - 1,
			)} --muted=true ${intermediate}`;
		}
		await $`ffmpeg -i ${intermediate}  -i tone.wav -t 10 -c:v copy -c:a aac ${targetPath} -y`;
	}

	const stat = await Bun.file(targetPath).stat();
	variants.push({
		videoCodec: 'h264',
		audioCodec: 'aac',
		container: 'mp4',
		fileNames: [outputName],
		size: stat.size,
		category: 'fps',
	});
}

copyFileSync('dialogue.wav', path.join(outDir, 'dialogue.wav'));
const dialogueStat = await Bun.file(path.join(outDir, 'dialogue.wav')).stat();
variants.push({
	videoCodec: 'none',
	audioCodec: 'pcm',
	container: 'wav',
	fileNames: ['dialogue.wav'],
	size: dialogueStat.size,
	category: 'audio',
});

const multipleAudioStreamsFileName = 'multiple-audio-streams.mov';
const multipleAudioStreamsTarget = path.join(
	outDir,
	multipleAudioStreamsFileName,
);
if (await Bun.file(multipleAudioStreamsFileName).exists()) {
	if (!(await Bun.file(multipleAudioStreamsTarget).exists())) {
		copyFileSync(multipleAudioStreamsFileName, multipleAudioStreamsTarget);
	}

	const multipleAudioStreamsStat = await Bun.file(
		multipleAudioStreamsTarget,
	).stat();
	variants.push({
		videoCodec: 'h264',
		audioCodec: 'pcm',
		container: 'mov',
		fileNames: [multipleAudioStreamsFileName],
		size: multipleAudioStreamsStat.size,
		category: 'audio',
	});
}

// Generate PCM WAV sine tone files at various sample rates
const pcmSampleRates = [
	8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000, 88200, 96000,
	176400, 192000,
] as const;

for (const sr of pcmSampleRates) {
	const outputName = `audio-${sr}hz.wav`;
	const targetPath = path.join(outDir, outputName);
	if (!(await Bun.file(targetPath).exists())) {
		console.log(`Generating ${outputName} (sine 1kHz, 10s, pcm_s16le)`);
		await $`ffmpeg -f lavfi -i ${`sine=frequency=1000:sample_rate=${sr}:duration=10`} -c:a pcm_s16le -ar ${sr} ${targetPath} -y`;
	}
	const stat = await Bun.file(targetPath).stat();
	variants.push({
		videoCodec: 'none',
		audioCodec: 'pcm',
		container: 'wav',
		fileNames: [outputName],
		size: stat.size,
		category: 'sample-rates',
	});
}

copyFileSync('greenscreen.mp4', path.join(outDir, 'greenscreen.mp4'));
const greenscreenStat = await Bun.file(
	path.join(outDir, 'greenscreen.mp4'),
).stat();
variants.push({
	videoCodec: 'h264',
	audioCodec: 'aac',
	container: 'mp4',
	fileNames: ['greenscreen.mp4'],
	size: greenscreenStat.size,
	category: 'greenscreen',
});

copyFileSync(
	'first-frame-at-4sec.webm',
	path.join(outDir, 'first-frame-at-4sec.webm'),
);
const firstFrameStat = await Bun.file(
	path.join(outDir, 'first-frame-at-4sec.webm'),
).stat();
variants.push({
	videoCodec: 'vp9',
	audioCodec: 'opus',
	container: 'webm',
	fileNames: ['first-frame-at-4sec.webm'],
	size: firstFrameStat.size,
	category: 'edge-cases',
});

// Sound effects (pre-existing files, CC0 licensed)
const soundEffects = [
	{
		fileName: 'whoosh.wav',
		attribution:
			'Woosh by 1bob -- https://freesound.org/s/831936/ -- License: Creative Commons 0',
	},
	{
		fileName: 'whip.wav',
		attribution:
			'SWSH_Badminton Racquet_Recording_01_JW Audio by JW_Audio -- https://freesound.org/s/838766/ -- License: Creative Commons 0',
	},
	{
		fileName: 'page-turn.wav',
		attribution:
			'Draw Knife 1 by kenney.nl -- https://kenney.nl -- License: Creative Commons 0',
	},
	{
		fileName: 'switch.wav',
		attribution:
			'UI Audio - Switch 35 by kenney.nl -- https://kenney.nl -- License: Creative Commons 0',
	},
	{
		fileName: 'mouse-click.wav',
		attribution:
			'Mouse Click Sound.mp3 by Pixeliota -- https://freesound.org/s/678248/ -- License: Creative Commons 0',
	},
	{
		fileName: 'shutter-modern.wav',
		attribution:
			'DSLR Shutter fast 006.wav by ristooooo1 -- https://freesound.org/s/539136/ -- License: Creative Commons 0',
	},
	{
		fileName: 'shutter-old.wav',
		attribution:
			'Werra.wav by hmilleo -- https://freesound.org/s/409093/ -- License: Creative Commons 0',
	},
	{
		fileName: 'bruh.wav',
		attribution:
			'Bruh Sound Effect -- https://soundeffects.fandom.com/wiki/Bruh_Sound_Effect',
	},
	{
		fileName: 'windows-xp-error.wav',
		attribution:
			'Windows XP Error -- https://www.myinstants.com/en/instant/windows-xp-error/',
	},
	{
		fileName: 'vine-boom.wav',
		attribution:
			'Vine Boom Sound -- https://www.myinstants.com/en/instant/vine-boom-sound-70972/',
	},
	{
		fileName: 'ding.wav',
		attribution:
			'Ding Sound Effect -- https://www.myinstants.com/en/instant/ding-sound-effect/',
	},

	{
		fileName: 'fah.wav',
		attribution:
			'Fah meme -- https://www.myinstants.com/en/instant/fahhhhhhhhhhhhhh-3525/',
	},
	{
		fileName: 'spongebob-fail.wav',
		attribution:
			'SpongeBob fail -- https://www.myinstants.com/en/instant/spongebob-fail-11236/',
	},
	{
		fileName: 'omg-hell-nah.wav',
		attribution:
			'Oh my god bro hell nah -- https://www.myinstants.com/en/instant/oh-my-god-bro-oh-hell-nah-man-42939/',
	},
	{
		fileName: 'price-is-right-fail.wav',
		attribution:
			'Price Is Right fail horn -- https://www.myinstants.com/en/instant/fail-horn/',
	},
	{
		fileName: 'romance-meme.wav',
		attribution:
			'Romance meme -- https://www.myinstants.com/en/instant/romanceeeeeeeeeeeeee-29042/',
	},
	{
		fileName: 'bone-crack.wav',
		attribution:
			'Bone crack -- https://www.myinstants.com/en/instant/bone-crack-23901/',
	},
	{
		fileName: 'anime-wow.wav',
		attribution:
			'Anime wow -- https://www.myinstants.com/en/instant/anime-wow/',
	},
	{
		fileName: 'yippee.wav',
		attribution:
			'Yippee -- https://www.myinstants.com/en/instant/yippeeeeeeeeeeeeee-34261/',
	},
	{
		fileName: 'loading-lag.wav',
		attribution:
			'Loading lag -- https://www.myinstants.com/en/instant/lagging-loading-11339/',
	},
	{
		fileName: 'wilhelm-scream.wav',
		attribution:
			'Wilhelm scream -- https://www.myinstants.com/en/instant/man-screaming-aaaah-32768/',
	},
	{
		fileName: 'mac-quack.wav',
		attribution:
			'Mac quack -- https://www.myinstants.com/en/instant/mac-quack-83896/',
	},
	{
		fileName: 'skedaddle.wav',
		attribution:
			'Skedaddle -- https://www.myinstants.com/en/instant/skedaddle-78470/',
	},
	{
		fileName: 'snapchat-notification.wav',
		attribution:
			'Snapchat notification -- https://www.myinstants.com/en/instant/notification-snap-43481/',
	},
	{
		fileName: 'nelly-ahh.wav',
		attribution:
			'Nelly ahh -- https://www.myinstants.com/en/instant/nelly-ahh-89172/',
	},
	{
		fileName: 'sanctuary-guardian-what.wav',
		attribution:
			'Sanctuary Guardian what meme -- https://www.myinstants.com/en/instant/what-bottom-text-meme-sanctuary-guardian-s-24591/',
	},
	{
		fileName: 'minecraft-hurt.wav',
		attribution:
			'Minecraft hurt -- https://www.myinstants.com/en/instant/minecraft-hurt/',
	},
	{
		fileName: 'oh-my-god-vine.wav',
		attribution:
			'Oh my god vine -- https://www.myinstants.com/en/instant/oh-ma-gaud-vine-78004/',
	},
	{
		fileName: 'illuminati-confirmed.wav',
		attribution:
			'Illuminati confirmed -- https://www.myinstants.com/en/instant/illuminati-confirmed-meme-99730/',
	},
	{
		fileName: 'dramatic-boomer.wav',
		attribution:
			'Dramatic boomer -- https://www.myinstants.com/en/instant/dramatic-boomer-29428/',
	},
	{
		fileName: 'triggered.wav',
		attribution:
			'Triggered -- https://www.myinstants.com/en/instant/core-sound-effect-57998/',
	},
	{
		fileName: 'record-scratch.wav',
		attribution:
			'Record scratch sound effect -- https://www.myinstants.com/en/instant/record-scratch-sound-effect/',
	},
];

for (const sfx of soundEffects) {
	copyFileSync(sfx.fileName, path.join(outDir, sfx.fileName));
	const stat = await Bun.file(path.join(outDir, sfx.fileName)).stat();
	variants.push({
		videoCodec: 'none',
		audioCodec: 'pcm',
		container: 'wav',
		fileNames: [sfx.fileName],
		size: stat.size,
		category: 'sound-effects',
		attribution: sfx.attribution,
	});
}

// Generate HLS (m3u8) variants — H.264/AAC with both MPEG-TS and fMP4 segments
const hlsPresets = [
	{label: 'ts', segmentType: 'mpegts', segmentExt: 'ts'},
	{label: 'fmp4', segmentType: 'fmp4', segmentExt: 'm4s'},
] as const;

for (const preset of hlsPresets) {
	const outputName = `hls-${preset.label}.m3u8`;
	const targetPath = path.join(outDir, outputName);
	const segmentPattern = path.join(
		outDir,
		`hls-${preset.label}-%d.${preset.segmentExt}`,
	);
	const initFilename = `hls-${preset.label}-init.mp4`;

	if (!(await Bun.file(targetPath).exists())) {
		console.log(`Generating ${outputName}`);
		if (preset.segmentType === 'fmp4') {
			await $`ffmpeg -i ${baseMute} -i tone.wav -t 10 -c:v libx264 -c:a aac -hls_time 2 -hls_playlist_type vod -hls_segment_type fmp4 -hls_fmp4_init_filename ${initFilename} -hls_segment_filename ${segmentPattern} ${targetPath} -y`;
		} else {
			await $`ffmpeg -i ${baseMute} -i tone.wav -t 10 -c:v libx264 -c:a aac -hls_time 2 -hls_playlist_type vod -hls_segment_type mpegts -hls_segment_filename ${segmentPattern} ${targetPath} -y`;
		}
	}

	const playlistAliases = preset.label === 'ts' ? ['video.m3u8'] : [];
	for (const playlistAlias of playlistAliases) {
		copyFileSync(targetPath, path.join(outDir, playlistAlias));
	}

	const segmentFiles: string[] = [];
	for await (const segFile of new Bun.Glob(
		`hls-${preset.label}-*.${preset.segmentExt}`,
	).scan(outDir)) {
		segmentFiles.push(segFile);
	}
	if (
		preset.segmentType === 'fmp4' &&
		(await Bun.file(path.join(outDir, initFilename)).exists())
	) {
		segmentFiles.push(initFilename);
	}

	const stat = await Bun.file(targetPath).stat();
	variants.push({
		videoCodec: 'h264',
		audioCodec: 'aac',
		container: 'm3u8',
		fileNames: [...playlistAliases, outputName, ...segmentFiles.sort()],
		size: stat.size,
		category: 'hls',
	});
}

const audioHlsName = 'audio.m3u8';
const audioHlsTargetPath = path.join(outDir, audioHlsName);
const audioHlsSegmentPattern = path.join(outDir, 'audio-%d.ts');

if (!(await Bun.file(audioHlsTargetPath).exists())) {
	console.log(`Generating ${audioHlsName}`);
	await $`ffmpeg -i ${tonePath} -t 10 -vn -c:a aac -hls_time 2 -hls_playlist_type vod -hls_segment_type mpegts -hls_segment_filename ${audioHlsSegmentPattern} ${audioHlsTargetPath} -y`;
}

const audioSegmentFiles: string[] = [];
for await (const segFile of new Bun.Glob('audio-*.ts').scan(outDir)) {
	audioSegmentFiles.push(segFile);
}

const audioHlsStat = await Bun.file(audioHlsTargetPath).stat();
variants.push({
	videoCodec: 'none',
	audioCodec: 'aac',
	container: 'm3u8',
	fileNames: [audioHlsName, ...audioSegmentFiles.sort()],
	size: audioHlsStat.size,
	category: 'hls',
});

await Bun.write('variants.json', JSON.stringify(variants, null, 2));
