import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
import {execSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {readDir} from './get-pages.mjs';

const data = [];
const root = path.join(process.cwd(), 'docs');

const findId = (split, page) => {
	const found = split.find((s) => s.startsWith('id: '));
	if (found) {
		return found.substr('id: '.length);
	}

	return page
		.replace(process.cwd() + path.sep + 'docs' + path.sep, '')
		.replace(/.md$/, '')
		.replace(/.mdx$/, '');
};

const findTitle = (split) => {
	const title = split
		.find((s) => s.startsWith('title: '))
		.replace(/^title:\s/, '');
	if (title.startsWith('"') || title.startsWith("'")) {
		return title.substr(1, title.length - 2);
	}

	return title;
};

const findSlug = (split) => {
	const slugSearch = split.find((s) => s.startsWith('slug: '));
	if (!slugSearch) {
		return null;
	}

	const slug = slugSearch.replace(/^slug:\s/, '');
	if (slug.startsWith('"') || slug.startsWith("'")) {
		return slug.substr(1, slug.length - 2);
	}

	return slug;
};

const findNoAi = (split) => {
	const slugSearch = split.find((s) => s.startsWith('no_ai: true'));
	if (slugSearch) {
		return true;
	}
	return false;
};

const findCrumb = (split) => {
	const crumb = split
		.find((s) => s.startsWith('crumb: '))
		?.replace(/^crumb:\s/, '');
	if (crumb?.startsWith('"') || crumb?.startsWith("'")) {
		return crumb.substr(1, crumb.length - 2);
	}

	return crumb ?? null;
};

const pages = readDir(root);

for (const page of pages) {
	if (page.endsWith('.DS_Store')) {
		continue;
	}

	if (page.endsWith('.tsx')) {
		continue;
	}

	const opened = fs.readFileSync(page, 'utf8');
	const frontmatter =
		opened.match(/---\n((.|\n)*?)---\n/) ??
		opened.match(/---\r\n((.|\r\n)*?)---\r\n/);
	if (!frontmatter) {
		if (page.endsWith('.ts')) {
			continue;
		}
		console.log('No frontmatter for', page);
		continue;
	}

	const split = frontmatter[1].split(os.EOL);
	const id = findId(split, page).replaceAll(path.sep, path.posix.sep);
	const title = findTitle(split);
	const slug = findSlug(split);
	const noAi = findNoAi(split);
	const crumb = findCrumb(split);

	const relativePath = page
		.replace(process.cwd() + path.sep, '')
		.replaceAll(path.sep, path.posix.sep);

	const compId =
		'articles-' +
		relativePath
			.replaceAll(path.posix.sep, '-')
			.replace(/.md$/, '')
			.replace(/^\//, '')
			.replace(/.mdx$/, '');
	data.push({
		id,
		title,
		relativePath,
		compId,
		crumb,
		noAi,
		slug: (slug && slug.startsWith('/')
			? slug
			: path.join(
					path.dirname(
						relativePath
							.replace(/^docs\//, '')
							.replace(/.md$/, '')
							.replace(/.mdx$/, ''),
					),
					path.basename(slug ?? id),
				)
		).replace(/^\//, ''),
	});
}

fs.writeFileSync(
	path.join(process.cwd(), 'src', 'data', 'articles.ts'),
	`export const articles = ` + JSON.stringify(data, null, 2),
);

execSync('bun x prettier src/data/articles.ts --write');

// render cards
const serveUrl = await bundle({
	entryPoint: path.join(process.cwd(), './src/remotion/entry.ts'),
	publicDir: path.join(process.cwd(), 'static'),
});
const compositions = await getCompositions(serveUrl);

for (const composition of compositions.filter(
	(c) => c.id.startsWith('expert') || c.id.startsWith('template'),
)) {
	const output = `static/generated/${composition.id}.png`;
	if (fs.existsSync(output)) {
		console.log('Existed', composition.id);
		continue;
	} else {
		await renderStill({
			composition,
			output,
			serveUrl,
		});
		console.log('Rendered', composition.id);
	}
}

for (const entry of data) {
	const composition = compositions.find((c) => c.id === entry.compId);
	const output = `static/generated/${composition.id}.png`;
	if (fs.existsSync(output)) {
		continue;
	}

	const out = path.join(process.cwd(), entry.relativePath);
	await renderStill({
		composition,
		output,
		serveUrl,
	});

	const fileContents = fs.readFileSync(out, 'utf-8');
	const lines = fileContents
		.split(os.EOL)
		.filter((l) => !l.startsWith('image: '));
	const frontmatterLine = lines.findIndex((l) => l === '---');
	if (frontmatterLine === -1) {
		throw new Error('could not find frontmatter for ' + composition.id);
	}

	const newLines = [
		...lines.slice(0, frontmatterLine + 1),
		`image: /${output.substring('/static'.length)}`,
		...lines.slice(frontmatterLine + 1),
	].join(os.EOL);

	fs.writeFileSync(out, newLines);
	console.log('Rendered', composition.id);
}
