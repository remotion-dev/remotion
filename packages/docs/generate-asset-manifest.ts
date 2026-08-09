import fs from 'fs';
import path from 'path';

// The Vercel header rule for /assets/(.*) applies `max-age=31536000, immutable`
// to 404s as well, so browsers and CDNs can cache a "not found" for a year.
// This manifest lets middleware.ts distinguish real assets from misses and
// serve the misses with `Cache-Control: no-store` instead.
const buildDir = path.join(__dirname, 'build');
const assetsDir = path.join(buildDir, 'assets');

if (!fs.existsSync(assetsDir)) {
	throw new Error(
		`Expected ${assetsDir} to exist - run the Docusaurus build first`,
	);
}

const files: string[] = [];

const walk = (dir: string) => {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(full);
		} else if (entry.isFile()) {
			files.push(
				'/assets/' + path.relative(assetsDir, full).split(path.sep).join('/'),
			);
		}
	}
};

walk(assetsDir);
files.sort();

// A wrongly empty manifest would make the middleware 404 every asset.
// A real Docusaurus build emits thousands of files under /assets.
if (files.length < 100) {
	throw new Error(
		`Only found ${files.length} files under build/assets - refusing to write asset-manifest.json`,
	);
}

fs.writeFileSync(
	path.join(buildDir, 'asset-manifest.json'),
	JSON.stringify(files),
);

console.log(
	`[docs build] Wrote asset-manifest.json with ${files.length} entries`,
);
