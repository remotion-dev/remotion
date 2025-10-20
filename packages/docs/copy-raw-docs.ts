import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(__dirname, 'docs');
const OUTPUT_DIR = path.join(__dirname, 'static', '_raw', 'docs');

function getAllMdxFiles(dir: string, baseDir: string = dir): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dir, {withFileTypes: true});

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...getAllMdxFiles(fullPath, baseDir));
		} else if (entry.name.endsWith('.mdx')) {
			const relativePath = path.relative(baseDir, fullPath);
			files.push(relativePath);
		}
	}

	return files;
}

function copyRawDocs() {
	console.log('📄 Copying raw docs to static/_raw/docs/...');

	if (fs.existsSync(OUTPUT_DIR)) {
		fs.rmSync(OUTPUT_DIR, {recursive: true});
	}

	fs.mkdirSync(OUTPUT_DIR, {recursive: true});

	const mdxFiles = getAllMdxFiles(DOCS_DIR);

	let copiedCount = 0;
	for (const file of mdxFiles) {
		const sourcePath = path.join(DOCS_DIR, file);
		const destPath = path.join(OUTPUT_DIR, file).replace(/\.mdx$/, '.md');

		const destDir = path.dirname(destPath);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, {recursive: true});
		}

		fs.copyFileSync(sourcePath, destPath);
		copiedCount++;
	}

	console.log(`✅ Copied ${copiedCount} files to static/_raw/docs/`);
}

copyRawDocs();
