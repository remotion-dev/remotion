const OUT = new URL('../downloads/myinstants-7054/', import.meta.url);

const items: {slug: string; page: string}[] = [
	{slug: 'faaah', page: 'https://www.myinstants.com/en/instant/fahhhhhhhhhhhhhh-3525/'},
	{slug: 'spongebob-fail', page: 'https://www.myinstants.com/en/instant/spongebob-fail-11236/'},
	{slug: 'omg-hell-nah', page: 'https://www.myinstants.com/en/instant/oh-my-god-bro-oh-hell-nah-man-42939/'},
	{slug: 'x-files', page: 'https://www.myinstants.com/en/instant/x-files/'},
	{slug: 'fail-horn', page: 'https://www.myinstants.com/en/instant/fail-horn/'},
	{slug: 'romance', page: 'https://www.myinstants.com/en/instant/romanceeeeeeeeeeeeee-29042/'},
	{slug: 'bone-crack', page: 'https://www.myinstants.com/en/instant/bone-crack-23901/'},
	{slug: 'anime-wow', page: 'https://www.myinstants.com/en/instant/anime-wow/'},
	{slug: 'yippieh', page: 'https://www.myinstants.com/en/instant/yippeeeeeeeeeeeeee-34261/'},
	{slug: 'lagging', page: 'https://www.myinstants.com/en/instant/lagging-loading-11339/'},
	{slug: 'wilhelm-scream', page: 'https://www.myinstants.com/en/instant/man-screaming-aaaah-32768/'},
	{slug: 'quack', page: 'https://www.myinstants.com/en/instant/mac-quack-83896/'},
	{slug: 'skedaddle', page: 'https://www.myinstants.com/en/instant/skedaddle-78470/'},
	{slug: 'notification', page: 'https://www.myinstants.com/en/instant/notification-snap-43481/'},
	{slug: 'aah', page: 'https://www.myinstants.com/en/instant/nelly-ahh-89172/'},
	{slug: 'what', page: 'https://www.myinstants.com/en/instant/what-bottom-text-meme-sanctuary-guardian-s-24591/'},
	{slug: 'hurt', page: 'https://www.myinstants.com/en/instant/minecraft-hurt/'},
	{slug: 'oh-ma-gaud', page: 'https://www.myinstants.com/en/instant/oh-ma-gaud-vine-78004/'},
	{slug: 'illuminati', page: 'https://www.myinstants.com/en/instant/illuminati-confirmed-meme-99730/'},
	{slug: 'dramatic-boomer', page: 'https://www.myinstants.com/en/instant/dramatic-boomer-29428/'},
	{slug: 'core-trigger', page: 'https://www.myinstants.com/en/instant/core-sound-effect-57998/'},
];

const mp3Re = /https:\/\/www\.myinstants\.com\/media\/sounds\/[^"]+\.mp3/;

import {mkdir} from 'node:fs/promises';

await mkdir(OUT, {recursive: true});

const manifestLines = ['slug\tpage_url\tmp3_url\tlocal_file\tbytes'];
let ok = 0;
let fail = 0;

for (const {slug, page} of items) {
	try {
		const html = await fetch(page).then((r) => {
			if (!r.ok) {
				throw new Error(`HTTP ${r.status}`);
			}

			return r.text();
		});
		const mp3 = html.match(mp3Re)?.[0];
		if (!mp3) {
			console.error(`FAIL no mp3 link: ${slug}`);
			fail++;
			continue;
		}

		const fname = mp3.split('/').pop()!;
		const dest = new URL(`${slug}--${fname}`, OUT);
		const res = await fetch(mp3);
		if (!res.ok) {
			throw new Error(`HTTP ${res.status}`);
		}

		const buf = await res.arrayBuffer();
		await Bun.write(dest, buf);
		const bytes = buf.byteLength;
		manifestLines.push(
			`${slug}\t${page}\t${mp3}\t${dest.pathname}\t${bytes}`,
		);
		console.log(`OK ${slug} -> ${fname} (${bytes} bytes)`);
		ok++;
	} catch (err) {
		console.error(`FAIL ${slug}:`, err);
		fail++;
	}
}

await Bun.write(new URL('manifest.tsv', OUT), manifestLines.join('\n') + '\n');
console.log(`---\nDownloaded: ${ok}, Failed: ${fail}`);
