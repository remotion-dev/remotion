import {$} from 'bun';
import fs, {readFileSync, writeFileSync} from 'fs';
import path from 'path';
// @ts-ignore outside project
import * as seo from '../convert/app/seo';

// @ts-expect-error
await $`bunx turbo "@remotion/convert#build-spa"`;

const dir = path.join(__dirname, '../convert/spa-dist/client');

fs.cpSync(dir, path.join(__dirname, './build/convert'), {recursive: true});

const extraPages: {
	slug: string;
	pageTitle: string;
	description: string;
}[] = [];

for (const inputs of seo.inputContainers) {
	for (const outputs of seo.outputContainers) {
		extraPages.push({
			slug: `/convert/${inputs}-to-${outputs}`,
			pageTitle: seo.getPageTitle({
				input: inputs,
				output: outputs,
				type: 'convert',
			}),
			description: seo.getDescription({
				input: inputs,
				output: outputs,
				type: 'convert',
			}),
		});
	}
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

writeFileSync(
	path.join(__dirname, './build/convert/index.html'),
	getContentWithTitle(seo.getPageTitle(null), seo.getDescription(null)),
);

for (const page of extraPages) {
	const out = path.join(__dirname, `./build/${page.slug}/index.html`);
	if (!fs.existsSync(path.dirname(out))) {
		fs.mkdirSync(path.dirname(out), {recursive: true});
	}
	fs.writeFileSync(out, getContentWithTitle(page.pageTitle, page.description));
}
