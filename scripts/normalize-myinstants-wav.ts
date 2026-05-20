import {mkdir, readdir} from 'node:fs/promises';
import path from 'node:path';
import {$} from 'bun';

const DOWNLOADS = path.join(import.meta.dir, '../downloads/myinstants-7054');
const OUT = path.join(import.meta.dir, '../downloads/wav-normalized');
const REMOTION_MEDIA = path.join(
	import.meta.dir,
	'../packages/remotion-media',
);

export type SfxEntry = {
	slug: string;
	fileName: string;
	exportName: string;
	pageUrl: string;
	title: string;
	description: string;
	sourceGlob: string;
};

export const SFX_ENTRIES: SfxEntry[] = [
	{
		slug: 'faaah',
		fileName: 'faaah.wav',
		exportName: 'faaah',
		pageUrl: 'https://www.myinstants.com/en/instant/fahhhhhhhhhhhhhh-3525/',
		title: 'faaah',
		description: 'Faaah sound effect',
		sourceGlob: 'faaah--*',
	},
	{
		slug: 'spongebob-fail',
		fileName: 'spongebob-fail.wav',
		exportName: 'spongebobFail',
		pageUrl: 'https://www.myinstants.com/en/instant/spongebob-fail-11236/',
		title: 'spongebobFail',
		description: 'SpongeBob fail sound effect',
		sourceGlob: 'spongebob-fail--*',
	},
	{
		slug: 'omg-hell-nah',
		fileName: 'omg-hell-nah.wav',
		exportName: 'omgHellNah',
		pageUrl: 'https://www.myinstants.com/en/instant/oh-my-god-bro-oh-hell-nah-man-42939/',
		title: 'omgHellNah',
		description: 'Oh my god bro hell nah sound effect',
		sourceGlob: 'omg-hell-nah--*',
	},
	{
		slug: 'x-files',
		fileName: 'x-files.wav',
		exportName: 'xFiles',
		pageUrl: 'https://www.myinstants.com/en/instant/x-files/',
		title: 'xFiles',
		description: 'X-Files theme sound effect',
		sourceGlob: 'x-files--*',
	},
	{
		slug: 'fail-horn',
		fileName: 'fail-horn.wav',
		exportName: 'failHorn',
		pageUrl: 'https://www.myinstants.com/en/instant/fail-horn/',
		title: 'failHorn',
		description: 'Fail horn sound effect',
		sourceGlob: 'fail-horn--*',
	},
	{
		slug: 'romance',
		fileName: 'romance.wav',
		exportName: 'romance',
		pageUrl: 'https://www.myinstants.com/en/instant/romanceeeeeeeeeeeeee-29042/',
		title: 'romance',
		description: 'Romance sound effect',
		sourceGlob: 'romance--*',
	},
	{
		slug: 'bone-crack',
		fileName: 'bone-crack.wav',
		exportName: 'boneCrack',
		pageUrl: 'https://www.myinstants.com/en/instant/bone-crack-23901/',
		title: 'boneCrack',
		description: 'Bone crack sound effect',
		sourceGlob: 'bone-crack--*',
	},
	{
		slug: 'anime-wow',
		fileName: 'anime-wow.wav',
		exportName: 'animeWow',
		pageUrl: 'https://www.myinstants.com/en/instant/anime-wow/',
		title: 'animeWow',
		description: 'Anime wow sound effect',
		sourceGlob: 'anime-wow--*',
	},
	{
		slug: 'yippieh',
		fileName: 'yippieh.wav',
		exportName: 'yippieh',
		pageUrl: 'https://www.myinstants.com/en/instant/yippeeeeeeeeeeeeee-34261/',
		title: 'yippieh',
		description: 'Yippieh sound effect',
		sourceGlob: 'yippieh--*',
	},
	{
		slug: 'lagging',
		fileName: 'lagging.wav',
		exportName: 'lagging',
		pageUrl: 'https://www.myinstants.com/en/instant/lagging-loading-11339/',
		title: 'lagging',
		description: 'Lagging loading sound effect',
		sourceGlob: 'lagging--*',
	},
	{
		slug: 'wilhelm-scream',
		fileName: 'wilhelm-scream.wav',
		exportName: 'wilhelmScream',
		pageUrl: 'https://www.myinstants.com/en/instant/man-screaming-aaaah-32768/',
		title: 'wilhelmScream',
		description: 'Wilhelm scream sound effect',
		sourceGlob: 'wilhelm-scream--*',
	},
	{
		slug: 'quack',
		fileName: 'quack.wav',
		exportName: 'quack',
		pageUrl: 'https://www.myinstants.com/en/instant/mac-quack-83896/',
		title: 'quack',
		description: 'Mac quack sound effect',
		sourceGlob: 'quack--*',
	},
	{
		slug: 'skedaddle',
		fileName: 'skedaddle.wav',
		exportName: 'skedaddle',
		pageUrl: 'https://www.myinstants.com/en/instant/skedaddle-78470/',
		title: 'skedaddle',
		description: 'Skedaddle sound effect',
		sourceGlob: 'skedaddle--*',
	},
	{
		slug: 'notification-snap',
		fileName: 'notification-snap.wav',
		exportName: 'notificationSnap',
		pageUrl: 'https://www.myinstants.com/en/instant/notification-snap-43481/',
		title: 'notificationSnap',
		description: 'Snapchat notification sound effect',
		sourceGlob: 'notification--*',
	},
	{
		slug: 'aah',
		fileName: 'aah.wav',
		exportName: 'aah',
		pageUrl: 'https://www.myinstants.com/en/instant/nelly-ahh-89172/',
		title: 'aah',
		description: 'Aah sound effect',
		sourceGlob: 'aah--*',
	},
	{
		slug: 'what',
		fileName: 'what.wav',
		exportName: 'what',
		pageUrl:
			'https://www.myinstants.com/en/instant/what-bottom-text-meme-sanctuary-guardian-s-24591/',
		title: 'what',
		description: 'What meme sound effect',
		sourceGlob: 'what--*',
	},
	{
		slug: 'hurt',
		fileName: 'hurt.wav',
		exportName: 'hurt',
		pageUrl: 'https://www.myinstants.com/en/instant/minecraft-hurt/',
		title: 'hurt',
		description: 'Minecraft hurt sound effect',
		sourceGlob: 'hurt--*',
	},
	{
		slug: 'oh-ma-gaud',
		fileName: 'oh-ma-gaud.wav',
		exportName: 'ohMaGaud',
		pageUrl: 'https://www.myinstants.com/en/instant/oh-ma-gaud-vine-78004/',
		title: 'ohMaGaud',
		description: 'Oh ma gaud vine sound effect',
		sourceGlob: 'oh-ma-gaud--*',
	},
	{
		slug: 'illuminati',
		fileName: 'illuminati.wav',
		exportName: 'illuminati',
		pageUrl: 'https://www.myinstants.com/en/instant/illuminati-confirmed-meme-99730/',
		title: 'illuminati',
		description: 'Illuminati confirmed sound effect',
		sourceGlob: 'illuminati--*',
	},
	{
		slug: 'dramatic-boomer',
		fileName: 'dramatic-boomer.wav',
		exportName: 'dramaticBoomer',
		pageUrl: 'https://www.myinstants.com/en/instant/dramatic-boomer-29428/',
		title: 'dramaticBoomer',
		description: 'Dramatic boomer sound effect',
		sourceGlob: 'dramatic-boomer--*',
	},
	{
		slug: 'core-trigger',
		fileName: 'core-trigger.wav',
		exportName: 'coreTrigger',
		pageUrl: 'https://www.myinstants.com/en/instant/core-sound-effect-57998/',
		title: 'coreTrigger',
		description: 'Core trigger sound effect',
		sourceGlob: 'core-trigger--*',
	},
];

const matchGlob = (files: string[], glob: string): string | null => {
	const prefix = glob.replace('*', '');
	const matches = files.filter((f) => f.startsWith(prefix));
	return matches.sort().at(-1) ?? null;
};

const getMaxVolumeDb = async (input: string): Promise<number> => {
	const result =
		await $`ffmpeg -hide_banner -i ${input} -af volumedetect -f null -`.quiet().nothrow();
	const stderr = result.stderr.toString();
	const match = stderr.match(/max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/);
	if (!match) {
		throw new Error(`Could not detect max volume for ${input}`);
	}

	return Number.parseFloat(match[1]!);
};

const normalizeToWav = async (input: string, output: string) => {
	const maxVol = await getMaxVolumeDb(input);
	const gain = -3.0 - maxVol;
	await $`ffmpeg -hide_banner -y -i ${input} -af volume=${gain}dB -ar 44100 -ac 2 -c:a pcm_s16le ${output}`;
};

const getDurationInfo = async (wav: string): Promise<string> => {
	const result = await $`afinfo ${wav}`.quiet().nothrow();
	const out = result.stdout.toString() + result.stderr.toString();
	const durationMatch = out.match(/estimated duration:\s*([\d.]+)\s*sec/);
	const formatMatch = out.match(/Data format:\s*(.+)/);
	const duration = durationMatch?.[1] ?? '?';
	const format = formatMatch?.[1]?.trim() ?? '?';
	return `${duration} seconds (${format})`;
};

if (import.meta.main) {
await mkdir(OUT, {recursive: true});
const files = await readdir(DOWNLOADS);
const durations: Record<string, string> = {};

for (const entry of SFX_ENTRIES) {
	const source = matchGlob(files, entry.sourceGlob);
	if (!source) {
		throw new Error(`Missing source for ${entry.slug} (${entry.sourceGlob})`);
	}

	const input = path.join(DOWNLOADS, source);
	const staged = path.join(OUT, entry.fileName);
	const dest = path.join(REMOTION_MEDIA, entry.fileName);

	console.log(`Processing ${entry.slug} <- ${source}`);
	await normalizeToWav(input, staged);
	await $`cp ${staged} ${dest}`;
	durations[entry.fileName] = await getDurationInfo(dest);
	const verify = await getMaxVolumeDb(dest);
	console.log(`  -> ${entry.fileName}, peak ${verify} dB, ${durations[entry.fileName]}`);
}

await Bun.write(
	path.join(OUT, 'durations.json'),
	JSON.stringify(durations, null, 2),
);
console.log('Done.');
}
