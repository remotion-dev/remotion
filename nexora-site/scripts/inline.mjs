// Embute o JS e o CSS gerados pelo build de arquivo único no próprio index.html.
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';

const dir = 'dist-single';
let html = readFileSync(join(dir, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g, (_, file) => {
	const css = readFileSync(join(dir, file), 'utf8');
	return `<style>${css}</style>`;
});
html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g, (_, file) => {
	const js = readFileSync(join(dir, file), 'utf8').replace(/<\/script/gi, '<\\/script');
	return `<script type="module">${js}</script>`;
});
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');

// O favicon também vai embutido
const favicon = readFileSync('public/favicon.svg', 'utf8');
html = html.replace('href="./favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`);

writeFileSync(join(dir, 'nexora-digital.html'), html);
rmSync(join(dir, 'assets'), {recursive: true, force: true});
rmSync(join(dir, 'index.html'));
rmSync(join(dir, 'favicon.svg'), {force: true});
console.log(`dist-single/nexora-digital.html — ${(html.length / 1024).toFixed(0)} kB`);
