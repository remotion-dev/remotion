import fs from 'fs';
import path from 'path';
import {articles} from './src/data/articles';

const DOCS_DIR = path.join(__dirname, 'docs');
const OUTPUT_DIR = path.join(__dirname, 'static', '_raw', 'docs');

function copyRawDocs() {
	console.log('📄 Copying raw docs to static/_raw/docs/...');

	// Clean output directory
	if (fs.existsSync(OUTPUT_DIR)) {
		fs.rmSync(OUTPUT_DIR, {recursive: true});
	}

	fs.mkdirSync(OUTPUT_DIR, {recursive: true});

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
		const destPath = path.join(OUTPUT_DIR, `${slugPath}.md`);

		const destDir = path.dirname(destPath);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, {recursive: true});
		}

		fs.copyFileSync(sourcePath, destPath);
		copiedCount++;

		// For index routes, also create a flat .md file so /player.md works
		// Example: player/index → both player/index.md AND player.md
		if (article.slug.endsWith('/index')) {
			const slugWithoutIndex = article.slug.replace(/\/index$/, '');
			if (slugWithoutIndex) {
				const flatPath = path.join(OUTPUT_DIR, `${slugWithoutIndex}.md`);
				const flatDir = path.dirname(flatPath);
				if (!fs.existsSync(flatDir)) {
					fs.mkdirSync(flatDir, {recursive: true});
				}
				fs.copyFileSync(sourcePath, flatPath);
				copiedCount++;
			}
		}
	}

	console.log(`✅ Copied ${copiedCount} files to static/_raw/docs/`);
}

copyRawDocs();
