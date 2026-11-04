import path from 'node:path';

const brandRoot = path.resolve(import.meta.dir, '..');
const output = path.resolve(brandRoot, '../../out/readme-hero');

for (const theme of ['light', 'dark']) {
	const frames = path.join(output, theme);
	const render = Bun.spawn(
		[
			'bunx',
			'remotion',
			'render',
			'src/index.ts',
			theme === 'light' ? 'ReadmeHeroLight' : 'ReadmeHeroDark',
			frames,
			'--sequence',
			'--image-format=png',
			'--concurrency=4',
		],
		{cwd: brandRoot, stdout: 'inherit', stderr: 'inherit'},
	);
	if ((await render.exited) !== 0) {
		throw new Error(`Could not render the ${theme} README hero`);
	}

	const encode = Bun.spawn(
		[
			'python3',
			path.join(import.meta.dir, 'encode-readme-hero.py'),
			frames,
			path.join(output, `homepage-hero-${theme}`),
			'30',
		],
		{cwd: brandRoot, stdout: 'inherit', stderr: 'inherit'},
	);
	if ((await encode.exited) !== 0) {
		throw new Error(`Could not encode the ${theme} README hero`);
	}
}
