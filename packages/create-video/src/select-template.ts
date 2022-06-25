import chalk from 'chalk';
import minimist from 'minimist';
import prompts, {selectAsync} from './prompts';
import {stripAnsi} from './strip-ansi';
import type {Template} from './templates';
import {FEATURED_TEMPLATES} from './templates';

const parsed = minimist(process.argv.slice(2), {
	boolean: FEATURED_TEMPLATES.map((f) => f.cliId),
});

function padEnd(str: string, width: number): string {
	// Pulled from commander for overriding
	const len = Math.max(0, width - stripAnsi(str).length);
	return str + Array(len + 1).join(' ');
}

const descriptionColumn =
	Math.max(
		...FEATURED_TEMPLATES.map((t) =>
			typeof t === 'object' ? t.shortName.length : 0
		)
	) + 2;

export const selectTemplate = async () => {
	const isFlagSelected = FEATURED_TEMPLATES.find((f) => {
		return parsed[f.cliId];
	});

	if (isFlagSelected) {
		return isFlagSelected;
	}

	const selectedTemplate = (await selectAsync(
		{
			message: 'Choose a template:',
			optionsPerPage: 20,
			choices: FEATURED_TEMPLATES.map((template) => {
				if (typeof template === 'string') {
					return prompts.separator(template);
				}

				return {
					value: template,
					title:
						chalk.bold(padEnd(template.shortName, descriptionColumn)) +
						template.description.trim(),
				};
			}),
		},
		{}
	)) as Template;
	return selectedTemplate;
};
