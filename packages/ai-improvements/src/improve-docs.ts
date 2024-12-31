import {OpenAI} from 'openai';
import path from 'path';
import {getApis} from '../map-over-api';
import {findMistakes} from './tasks/find-mistakes';
import {generateJSDocTask} from './tasks/generate-jsdoc';

const openai = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
});

const apis = await getApis();

const task = 'generate-jsdoc';

for (const api of apis) {
	const contents = await Bun.file(api.filePath).text();
	if (!api.sourceCodePath) {
		continue;
	}

	const flag = path.join('.done', api.id);

	if (await Bun.file(flag).exists()) {
		console.log(`Article ${api.title} already processed`);
		continue;
	}

	const file = path.join(process.cwd(), '..', '..', api.sourceCodePath);
	const sourceContents = await Bun.file(file).text();
	console.log(`Article ${api.title} contains source code`);

	const reply =
		task === 'generate-jsdoc'
			? await generateJSDocTask({
					contents,
					link: api.link,
					openai,
					sourceContents,
					filePath: file,
					title: api.title,
				})
			: await findMistakes({
					sourceContents,
					openai,
					contents,
				});

	await Bun.write(flag, 'txt');
	if (reply !== 'OK') {
	}
}
