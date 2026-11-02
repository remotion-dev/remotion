import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';

const repoRoot = resolve(import.meta.dir, '../..');
const docsDir = join(repoRoot, 'packages/docs/docs');
const blogDir = join(repoRoot, 'packages/docs/blog');
const files: string[] = [];
const directories = [docsDir, blogDir];

while (directories.length > 0) {
	const directory = directories.pop()!;
	for (const entry of readdirSync(directory, {withFileTypes: true}).sort(
		(a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
	)) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			directories.push(path);
		} else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
			files.push(path);
		}
	}
}

// Links to github.com/remotion-dev/remotion/(blob|tree)/<ref>/<path>
const sourceLinkRegex =
	/https?:\/\/github\.com\/remotion-dev\/remotion\/(?:blob|tree)\/([^/\s"'`<>()[\]{}]+)\/?([^\s"'`<>()[\]]*)/g;
const refAvailable = new Map<string, boolean>();

const errors: string[] = [];
const warnings: string[] = [];
for (const file of files.sort()) {
	const lines = readFileSync(file, 'utf8').split(/\r?\n/);
	const location = (index: number) =>
		`${relative(repoRoot, file)}:${index + 1}`;

	lines.forEach((line, index) => {
		for (const [url, ref, rawPath] of line.matchAll(sourceLinkRegex)) {
			// Template literal links are built at runtime and can't be checked
			if (url.includes('${')) {
				continue;
			}

			const [pathWithoutAnchor, anchor] = rawPath
				.replace(/[.,;:!?*_]+$/, '')
				.split('#');
			const filePath = decodeURIComponent(
				pathWithoutAnchor.split('?')[0],
			).replace(/\/$/, '');

			if (ref === 'main') {
				if (anchor && /^L\d+/.test(anchor)) {
					errors.push(
						`${location(index)}: Line anchors on "main" links go stale, pin the link to a commit SHA instead: ${url}`,
					);
				}

				if (!existsSync(join(repoRoot, filePath))) {
					errors.push(
						`${location(index)}: Path does not exist on main: ${url}`,
					);
				}

				continue;
			}

			if (!refAvailable.has(ref)) {
				refAvailable.set(
					ref,
					spawnSync('git', ['cat-file', '-e', `${ref}^{commit}`], {
						cwd: repoRoot,
					}).status === 0,
				);
			}

			if (!refAvailable.get(ref)) {
				warnings.push(
					`${location(index)}: Skipping, ref "${ref}" is not available locally: ${url}`,
				);
				continue;
			}

			if (
				filePath !== '' &&
				spawnSync(
					'git',
					['rev-parse', '--verify', '--quiet', `${ref}:${filePath}`],
					{
						cwd: repoRoot,
					},
				).status !== 0
			) {
				errors.push(
					`${location(index)}: Path does not exist at ${ref}: ${url}`,
				);
			}
		}
	});

	if (!file.startsWith(docsDir) || lines[0] !== '---') {
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
				`${location(index)}: Put the page-level version in the title as # Title<AvailableFrom v="..." />`,
			);
		}
	}
}

for (const warning of warnings) {
	console.warn(`Warning: ${warning}`);
}

if (errors.length > 0) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
} else {
	console.log(
		`Checked ${files.length} docs pages for page-level version placement and GitHub source links.`,
	);
}
