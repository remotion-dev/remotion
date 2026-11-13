import {expect, test} from 'bun:test';
import {
	mkdtempSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

for (const overviewFirst of [true, false]) {
	for (const alias of [null, 'ApiContents']) {
		test(`shared TOC category ignores subset importers: overviewFirst=${overviewFirst}, alias=${alias}`, () => {
			const root = mkdtempSync(path.join(tmpdir(), 'remotion-toc-'));
			try {
				mkdirSync(path.join(root, 'docs'));
				writeFileSync(
					path.join(root, 'check-toc-sync.ts'),
					readFileSync(path.join(import.meta.dir, 'check-toc-sync.ts')),
				);
				const overview = overviewFirst ? 'a-overview' : 'z-overview';
				const api = overviewFirst ? 'z-api' : 'a-api';
				const page = (name: string, content: string) =>
					writeFileSync(path.join(root, 'docs', name + '.mdx'), content);
				page(
					overview,
					`---\ntitle: Overview guide\n---\nimport {Subset} from './table-of-contents';\n<Subset />`,
				);
				page(
					api,
					`---\ntitle: API reference\n---\nimport {TableOfContents${alias ? ' as ' + alias : ''}} from './table-of-contents';\n<${alias ?? 'TableOfContents'} />`,
				);
				page('guide', '---\ntitle: Guide\n---\n');
				page('method', '---\ntitle: method()\n---\n');
				writeFileSync(
					path.join(root, 'sidebars.ts'),
					`export default {docs: [
{type: 'category', link: {type: 'doc', id: '${overview}'}, items: ['guide']},
{type: 'category', link: {type: 'doc', id: '${api}'}, items: ['method']}
]};`,
				);
				const toc = path.join(root, 'docs', 'table-of-contents.tsx');
				writeFileSync(toc, '<TOCItem link="/docs/method" />');
				const inventory = [
					...(overviewFirst ? [overview, api] : [api, overview]).map(
						(name) => name + '.mdx',
					),
					'guide.mdx',
					'method.mdx',
					'table-of-contents.tsx',
				];
				const preload = path.join(root, 'inventory.ts');
				writeFileSync(
					preload,
					`import fs from 'node:fs';
const read = fs.readdirSync;
const order = ${JSON.stringify(inventory)};
fs.readdirSync = (directory, options) => {
 const entries = read(directory, options);
 if (fs.realpathSync(String(directory)) === fs.realpathSync(${JSON.stringify(path.join(root, 'docs'))})) {
  entries.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  console.log('inventory:' + JSON.stringify(entries.map(entry => entry.name)));
 }
 return entries;
};`,
				);
				const run = () =>
					Bun.spawnSync({
						cmd: [
							process.execPath,
							'--preload',
							preload,
							path.join(root, 'check-toc-sync.ts'),
						],
					});
				const complete = run();
				expect(complete.stdout.toString()).toContain(
					'inventory:' + JSON.stringify(inventory),
				);
				expect(complete.exitCode).toBe(0);

				// A genuine missing API entry must still fail the same checker.
				writeFileSync(toc, '<TOCItem link="/docs/guide" />');
				const missing = run();
				expect(missing.exitCode).toBe(1);
				expect(missing.stderr.toString()).toContain(
					'does not link to /docs/method',
				);
			} finally {
				rmSync(root, {recursive: true, force: true});
			}
		});
	}
}
