import {$} from 'bun';
import fs from 'fs';
import path from 'path';

await $`bunx turbo "@remotion/convert#build-spa"`;

const dir = path.join(__dirname, '../convert/spa-dist/client');

fs.cpSync(dir, path.join(__dirname, './build/convert'), {recursive: true});

const extraSlugs = ['convert-mp4-to-webm'];
for (const slug of extraSlugs) {
	const out = path.join(__dirname, `./build/${slug}/index.html`);
	if (!fs.existsSync(path.dirname(out))) {
		fs.mkdirSync(path.dirname(out), {recursive: true});
	}
	fs.copyFileSync(path.join(dir, 'index.html'), out);
}
