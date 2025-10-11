import {OpenAI} from 'openai';
import {generateJsDocForApi} from '../generate-jsdoc-for-api';
import {Api} from '../map-over-api';
import {addJsDocComment} from './add-jsdoc-comment';

export const generateJSDocTask = async ({
	sourceContents,
	openai,
	contents,
	link,
	title,
	filePath,
	api,
}: {
	sourceContents: string;
	openai: OpenAI;
	contents: string;
	link: string;
	title: string;
	filePath: string;
	api: Api;
}) => {
	if (title.startsWith('npx remotion')) {
		return;
	}

	const reply = await generateJsDocForApi({
		sourceContents,
		openai,
		contents,
		link,
		api,
	});

	const newDocument = addJsDocComment({
		documentTitle: title,
		sourceCode: sourceContents,
		comment: reply,
	});
	await Bun.write(filePath, newDocument);

	return reply;
};
