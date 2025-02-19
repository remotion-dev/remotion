import {$} from 'bun';
import fs, {readFileSync} from 'fs';
import path from 'path';
// @ts-ignore outside project
import * as seo from '../convert/app/seo';

await $`bunx turbo "@remotion/convert#build-spa"`;

const dir = path.join(__dirname, '../convert/spa-dist/client');

fs.cpSync(dir, path.join(__dirname, './build/convert'), {recursive: true});
fs.cpSync(
	path.join(__dirname, './build/convert/convert-service-worker.js'),
	path.join(__dirname, './build/convert-service-worker.js'),
);

const extraPages: seo.RouteAction[] = [];

for (const inputs of seo.inputContainers) {
	for (const outputs of seo.outputContainers) {
		extraPages.push({
			input: inputs,
			output: outputs,
			type: 'convert',
		});
	}

	extraPages.push({
		type: 'rotate-format',
		format: inputs,
	});

	extraPages.push({
		type: 'mirror-format',
		format: inputs,
	});

	extraPages.push({
		type: 'resize-format',
		format: inputs,
	});
}

const contents = path.join(dir, 'index.html');

// Replace the text in <title>
const getContentWithTitle = (title: string, description: string) => {
	const c = readFileSync(contents, 'utf-8');
	const matcher = '<title>Remotion Convert</title>';

	if (!c.includes(matcher)) {
		throw new Error('Could not find title');
	}

	const descriptionMatcher =
		'<meta name="description" content="Remotion Convert"/>';
	if (!c.includes(descriptionMatcher)) {
		throw new Error('Could not find description');
	}

	return c
		.replace(
			descriptionMatcher,
			`<meta name="description" content="${description}" />`,
		)
		.replace(matcher, `<title>${title}</title>`);
};

extraPages.push({
	type: 'generic-convert',
});

extraPages.push({
	type: 'generic-rotate',
});

extraPages.push({
	type: 'generic-mirror',
});

extraPages.push({
	type: 'generic-probe',
});

extraPages.push({
	type: 'generic-resize',
});

extraPages.push({
	type: 'report',
});

for (const page of extraPages) {
	const slug = seo.makeSlug(page);
	const pageTitle = seo.getPageTitle(page);
	const description = seo.getDescription(page);
	const out = path.join(__dirname, `./build${slug}/index.html`);

	if (!fs.existsSync(path.dirname(out))) {
		fs.mkdirSync(path.dirname(out), {recursive: true});
	}
	fs.writeFileSync(out, getContentWithTitle(pageTitle, description));
}
