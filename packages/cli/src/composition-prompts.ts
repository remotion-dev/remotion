import type {LogLevel} from '@remotion/renderer';
import type {PromptObject} from 'prompts';
import prompts from 'prompts';
import {Log} from './log';

type Question<V extends string = string> = PromptObject<V> & {
	optionsPerPage?: number;
};
type NamelessQuestion = Omit<Question<'value'>, 'name'>;

function prompt(questions: Question, logLevel: LogLevel) {
	return prompts([questions], {
		onCancel() {
			Log.error({indent: false, logLevel}, 'No composition selected.');
			process.exit(1);
		},
	});
}

export async function selectAsync(
	question: NamelessQuestion,
	logLevel: LogLevel,
): Promise<string | string[]> {
	const {value} = await prompt(
		{
			...question,
			name: 'value',
			type: question.type,
		},
		logLevel,
	);
	return value ?? null;
}
