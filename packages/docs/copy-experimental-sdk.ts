import fs from 'fs';
import path from 'path';
import {$} from 'bun';

// remotion.dev/experimental_sdk hosts the Vibe Code template as a static
// export, with the starter project embedded at build time. The template's
// workspace dependencies are dependencies of the docs, so they are built.
const basePath = '/experimental_sdk';
const templateDir = path.join(__dirname, '../template-vibe-code');
const outDir = path.join(templateDir, 'out');
const destination = path.join(__dirname, 'build', basePath.slice(1));

await $`bun run build`.cwd(templateDir).env({
	...process.env,
	STATIC_EXPORT_BASE_PATH: basePath,
});

if (!fs.existsSync(path.join(outDir, 'index.html'))) {
	throw new Error(`Expected the static export at ${outDir}`);
}

fs.rmSync(destination, {recursive: true, force: true});
fs.mkdirSync(path.dirname(destination), {recursive: true});
fs.cpSync(outDir, destination, {recursive: true});
console.log(`[docs build] Copied the Vibe Code editor to ${basePath}`);
