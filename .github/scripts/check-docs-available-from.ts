import {readdirSync, readFileSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';

const docsDir = resolve(import.meta.dir, '../../packages/docs/docs');
const files: string[] = [];
const directories = [docsDir];

while (directories.length > 0) {
	const directory = directories.pop()!;
	for (const entry of readdirSync(directory, {withFileTypes: true}).sort(
		(a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
	)) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			directories.push(path);
		} else if (entry.isFile() && entry.name.endsWith('.mdx')) {
			files.push(path);
		}
	}
}

const errors: string[] = [];
for (const file of files.sort()) {
	const lines = readFileSync(file, 'utf8').split(/\r?\n/);
	if (lines[0] !== '---') {
		continue;
	}
	const frontmatterEnd = lines.indexOf('---', 1);
	if (frontmatterEnd === -1) {
		continue;
	}

	let inFence = false;
	for (let index = frontmatterEnd + 1; index < lines.length; index++) {
		const line = lines[index].trim();
		if (!inFence && /^##\s/.test(line)) {
			break;
		}
		if (/^```/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}

		if (
			/^<AvailableFrom\b[^>]*\/>$/.test(line) ||
			/^_.*available (?:from|since) v?\d.*_$/i.test(line)
		) {
			errors.push(
				`${relative(resolve(docsDir, '../../..'), file)}:${index + 1}: Put the page-level version in the title as # Title<AvailableFrom v="..." />`,
			);
		}
	}
}

if (errors.length > 0) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
} else {
	console.log(
		`Checked ${files.length} docs pages for page-level version placement.`,
	);
}
