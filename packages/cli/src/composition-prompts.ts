import type {Options, PromptObject} from 'prompts';
import prompts from 'prompts';

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
			throw new Error('User cancelled selection.');
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
			limit: 11,
			...question,
			name: 'value',
			type: question.type,
		},
		options
	);
	return value ?? null;
}
