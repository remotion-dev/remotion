import {expect, test} from 'bun:test';
import {
	mkdtempSync,
	mkdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

for (const overviewFirst of [true, false]) {
	for (const alias of [null, 'ApiContents']) {
		test(`shared TOC category ignores subset importers: overviewFirst=${overviewFirst}, alias=${alias}`, () => {
			const root = realpathSync(
				mkdtempSync(path.join(tmpdir(), 'remotion-toc-')),
			);
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
				const entry = path.join(root, 'inventory.ts');
				writeFileSync(
					entry,
					`import {checkTocSync} from './check-toc-sync';
import path from 'node:path';
const order = ${JSON.stringify(inventory)};
const files = order.map(name => path.join(${JSON.stringify(path.join(root, 'docs'))}, name));
console.log('inventory:' + JSON.stringify(files.map(file => path.basename(file))));
checkTocSync(files);`,
				);
				const run = () =>
					Bun.spawnSync({
						cmd: [process.execPath, entry],
					});
				const complete = run();
				expect(complete.stdout.toString()).toContain(
					'inventory:' + JSON.stringify(inventory),
				);
				expect({
					exitCode: complete.exitCode,
					stderr: complete.stderr.toString(),
				}).toEqual({exitCode: 0, stderr: ''});

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
