import chalk from 'chalk';
import minimist from 'minimist';
import {makeHyperlink} from './hyperlinks/make-link';
import {selectAsync} from './prompts';
import type {Template} from './templates';
import {FEATURED_TEMPLATES} from './templates';

type Options = {
	tmp: boolean;
};

const parsed = minimist<Options>(process.argv.slice(2), {
	boolean: [...FEATURED_TEMPLATES.map((f) => f.cliId), 'tmp'],
});

export const isTmpFlagSelected = () => parsed.tmp;

export const selectTemplate = async () => {
	const isFlagSelected = FEATURED_TEMPLATES.find((f) => {
		return parsed[f.cliId];
	});

	if (isFlagSelected) {
		return isFlagSelected;
	}

	return (await selectAsync({
		message: 'Choose a template:',
		optionsPerPage: 20,

		choices: FEATURED_TEMPLATES.map((template) => {
			return {
				value: template,
				title: `${chalk.blue(template.shortName)}${chalk.reset(
					` ${chalk.gray(template.description.trim())} ${chalk.gray(
						makeHyperlink({
							text: '(?)',
							url: `https://remotion.dev/templates/${template.cliId}`,
							fallback: '',
						}),
					)}`,
				)}`,
			};
		}),
	})) as Template;
};
