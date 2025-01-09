import path from 'path';
import {articles} from '../../docs/src/data/articles';

const getSourceCodeLink = async (filePath: string) => {
	const contents = await Bun.file(filePath).text();
	const containsSourceCode = contents
		.toLowerCase()
		.includes('source code for ');

	if (!containsSourceCode) {
		return null;
	}

	const match = contents.match(/\[.*source code for.*\]\((.*)\)/i);
	if (!match) {
		return null;
	}
	if (contents.includes('Source code for this documentation')) {
		return null;
	}
	if (contents.includes('Source code for this SDK')) {
		return null;
	}
	const url = match[1];
	const p = url.replace(
		'https://github.com/remotion-dev/remotion/blob/main/',
		'',
	);

	return p;
};

export type Api = {
	filePath: string;
	sourceCodePath: string | null;
	id: string;
	title: string;
	link: string;
};

const arr: Api[] = [];

export const getApis = async () => {
	for (const article of articles) {
		if (article.noAi) {
			continue;
		}
		const filePath = path.join(
			path.join(process.cwd(), '..', 'docs', article.relativePath),
		);
		const sourceCodeLink = await getSourceCodeLink(filePath);
		arr.push({
			filePath,
			sourceCodePath: sourceCodeLink,
			id: article.id,
			title: article.title,
			link: `https://www.remotion.dev/docs/${article.slug}`,
		});
	}

	return arr;
};
