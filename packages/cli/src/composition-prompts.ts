import type {Options, PromptObject} from 'prompts';
import prompts from 'prompts';
import {Log} from './log';

export type Question<V extends string = string> = PromptObject<V> & {
	optionsPerPage?: number;
};
export type NamelessQuestion = Omit<Question<'value'>, 'name'>;
type PromptOptions = {nonInteractiveHelp?: string} & Options;

export default function prompt(
	questions: Question | Question[],
	{nonInteractiveHelp, ...options}: PromptOptions = {}
) {
	questions = Array.isArray(questions) ? questions : [questions];
	return prompts(questions, {
		onCancel() {
			Log.error('No composition selected.');
			process.exit(1);
		},
		...options,
	});
}

export async function selectAsync(
	question: NamelessQuestion,
	options?: PromptOptions
): Promise<string | string[]> {
	const {value} = await prompt(
		{
			...question,
			name: 'value',
			type: question.type,
		},
		options
	);
	return value ?? null;
}
