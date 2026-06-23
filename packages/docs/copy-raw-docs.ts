import fs from 'fs';
import path from 'path';
import {expandElementSourceReferences} from './plugins/element-source-utils.js';
import {articles} from './src/data/articles';

const DOCS_DIR = path.join(__dirname, 'docs');
const ELEMENTS_DIR = path.join(__dirname, 'elements');
const RAW_DIR = path.join(__dirname, 'static', '_raw');
const DOCS_OUTPUT_DIR = path.join(RAW_DIR, 'docs');
const ELEMENTS_OUTPUT_DIR = path.join(RAW_DIR, 'elements');

const writeRawMarkdown = ({
	destPath,
	sourcePath,
}: {
	destPath: string;
	sourcePath: string;
}) => {
	const destDir = path.dirname(destPath);
	if (!fs.existsSync(destDir)) {
		fs.mkdirSync(destDir, {recursive: true});
	}

	const raw = fs.readFileSync(sourcePath, 'utf8');
	fs.writeFileSync(
		destPath,
		expandElementSourceReferences({
			raw,
			sourceFilePath: sourcePath,
		}),
	);
};

const hasNoAiFrontmatter = (contents: string) => {
	const frontmatter = contents.match(/^---\n([\s\S]*?)\n---/);
	return frontmatter ? /^noAi:\s*true\s*$/m.test(frontmatter[1]) : false;
};

function copyRawDocs() {
	console.log('📄 Copying raw docs to static/_raw/docs/...');

	fs.mkdirSync(DOCS_OUTPUT_DIR, {recursive: true});

	let copiedCount = 0;

	for (const article of articles) {
		// Skip docs marked as noAi
		if (article.noAi) {
			continue;
		}

		// Remove 'docs/' prefix from relativePath since we're already in docs/
		const relativePathWithoutDocs = article.relativePath.replace(/^docs\//, '');
		const sourcePath = path.join(DOCS_DIR, relativePathWithoutDocs);
		if (!fs.existsSync(sourcePath)) {
			console.warn(`⚠️  Source file not found: ${sourcePath}`);
			continue;
		}

		// Use slug to determine destination path (handles cases like transitions.mdx → transitioning.md)
		// Special case: empty slug (homepage) should be index.md
		const slugPath = article.slug === '' ? 'index' : article.slug;
		const destPath = path.join(DOCS_OUTPUT_DIR, `${slugPath}.md`);

		writeRawMarkdown({destPath, sourcePath});
		copiedCount++;

		// For index routes, also create a flat .md file so /player.md works
		// Example: player/index → both player/index.md AND player.md
		if (article.slug.endsWith('/index')) {
			const slugWithoutIndex = article.slug.replace(/\/index$/, '');
			if (slugWithoutIndex) {
				const flatPath = path.join(DOCS_OUTPUT_DIR, `${slugWithoutIndex}.md`);
				writeRawMarkdown({destPath: flatPath, sourcePath});
				copiedCount++;
			}
		}
	}

	console.log(`✅ Copied ${copiedCount} files to static/_raw/docs/`);
}

const findElementMdxFiles = (dir: string): string[] => {
	const files: string[] = [];

	for (const entry of fs.readdirSync(dir)) {
		const fullPath = path.join(dir, entry);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			files.push(...findElementMdxFiles(fullPath));
			continue;
		}

		if (entry.endsWith('.mdx')) {
			files.push(fullPath);
		}
	}

	return files;
};

function copyRawElements() {
	console.log('🧩 Copying raw Elements docs to static/_raw/elements/...');

	fs.mkdirSync(ELEMENTS_OUTPUT_DIR, {recursive: true});

	let copiedCount = 0;

	for (const sourcePath of findElementMdxFiles(ELEMENTS_DIR)) {
		const contents = fs.readFileSync(sourcePath, 'utf8');
		if (hasNoAiFrontmatter(contents)) {
			continue;
		}

		const relativePath = path.relative(ELEMENTS_DIR, sourcePath);
		const parsed = path.parse(relativePath);
		const slug =
			parsed.name === 'index'
				? parsed.dir || 'index'
				: path.join(parsed.dir, parsed.name);
		const destPath = path.join(ELEMENTS_OUTPUT_DIR, `${slug}.md`);

		writeRawMarkdown({destPath, sourcePath});
		copiedCount++;

		if (parsed.name === 'index' && parsed.dir) {
			const indexPath = path.join(ELEMENTS_OUTPUT_DIR, parsed.dir, 'index.md');
			writeRawMarkdown({destPath: indexPath, sourcePath});
			copiedCount++;
		}
	}

	console.log(`✅ Copied ${copiedCount} files to static/_raw/elements/`);
}

function copyRawContent() {
	// Clean output directory
	if (fs.existsSync(RAW_DIR)) {
		fs.rmSync(RAW_DIR, {recursive: true});
	}

	copyRawDocs();
	copyRawElements();
}

copyRawContent();
