import fs from 'fs';
import path from 'path';

const getHead = async (text: string) => {
	const rewriter = new HTMLRewriter();
	rewriter.on('*', {
		element(element) {
			if (element.tagName === 'body') {
				element.remove();
			}
		},
	});

	const res = rewriter.transform(new Response(text));
	const t = await res.text();
	return t
		.replace('<!doctype html>', '')
		.replace('<html lang="en">', '')
		.replace('<head>', '')
		.replace('</head>', '')
		.replace('</html>', '');
};

const getBody = async (text: string) => {
	const rewriter = new HTMLRewriter();
	rewriter.on('*', {
		element(element) {
			if (element.tagName === 'head') {
				element.remove();
			}
		},
	});

	const res = rewriter.transform(new Response(text));
	const t = await res.text();
	return t
		.replace('<!doctype html>', '')
		.replace('<html lang="en">', '')
		.replace('<body', '<div')
		.replace('</body>', '</div>')
		.replace('</html>', '');
};

const copyLanding = async () => {
	const promoPagesOut = path.join(__dirname, '..', 'promo-pages', 'out');
	const index = path.join(promoPagesOut, 'index.html');
	const contents = await Bun.file(index).text();

	const rewriter = new HTMLRewriter();

	rewriter.on('link', {
		element(element) {
			if (element.getAttribute('rel') === 'preload') {
				element.remove();
				return;
			}
			if (element.getAttribute('rel') === 'icon') {
				element.remove();
				return;
			}
		},
	});

	const newRes = await rewriter.transform(new Response(contents)).text();
	const head = await getHead(newRes);
	const body = await getBody(newRes);

	const finalRewriter = new HTMLRewriter();
	let addedHead = false;
	finalRewriter.on('#shell', {
		element(element) {
			element.replace(body, {
				html: true,
			});
		},
	});
	finalRewriter.on('meta', {
		element(element) {
			if (!addedHead) {
				element.after(head, {
					html: true,
				});
			}
		},
	});
	const shell = Bun.file('build/shell/index.html');

	await Bun.write(
		'build/newlanding.html',
		finalRewriter.transform(await shell.text()),
	);
	fs.cpSync(
		path.join(promoPagesOut, '_next'),
		path.join(__dirname, 'build', '_next'),
		{recursive: true},
	);
};

copyLanding();
