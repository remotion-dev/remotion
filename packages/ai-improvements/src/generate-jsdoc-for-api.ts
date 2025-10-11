import {OpenAI} from 'openai';
import path from 'path';
import {Api} from './map-over-api';

export const generateJsDocForApi = async ({
	openai,
	link,
	sourceContents,
	contents,
	api,
}: {
	openai: OpenAI;
	link: string;
	sourceContents: string;
	contents: string;
	api: Api;
}) => {
	const checkLinkValid = await fetch(link);
	if (!checkLinkValid.ok) {
		throw new Error('The link is not valid: ' + link);
	}

	const cache = Bun.file(path.join('.jsdoc', api.id));

	if (await cache.exists()) {
		return cache.text();
	}

	const stream = await openai.chat.completions.create({
		model: 'gpt-4-turbo',
		messages: [
			{
				role: 'system',
				content: [
					'You are going to be given an API source code and an API documentation, and a URL to use.',
					"If not, write a JSDoc comment for the function. Only write the JSDoc comment, don't reply anything else.",
					'Put the URL as the documentation.',
					'This is the right format for a JSDoc comment:\n',
					`
/**
 * @description Triggers a render on a lambda given a composition and a lambda function.
 * @see [Documentation](https://remotion.dev/docs/lambda/rendermediaonlambda)
 */
          `,
					'Dont document params or return values, only the description and the @see tag.',
				].join('\n'),
			},
			{
				role: 'system',
				content: 'This is the url to use:\n' + link,
			},
			{
				role: 'user',
				content: 'This is the source code for the API:\n' + sourceContents,
			},
			{
				role: 'user',
				content: 'This is the markdown of the documentation:\n' + contents,
			},
		],
		stream: true,
	});
	let reply = '';
	for await (const chunk of stream) {
		reply += chunk.choices[0]?.delta?.content || '';
	}

	await Bun.write(cache, reply);

	return reply;
};
