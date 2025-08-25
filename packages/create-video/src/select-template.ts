import chalk from 'chalk';
import minimist from 'minimist';
import {makeHyperlink} from './hyperlinks/make-link';
import {selectAsync} from './prompts';
import type {Template} from './templates';
import {FEATURED_TEMPLATES, PAID_TEMPLATES} from './templates';

const ALL_TEMPLATES = [...FEATURED_TEMPLATES, ...PAID_TEMPLATES];

type Options = {
	tmp: boolean;
};

const parsed = minimist<Options>(process.argv.slice(2), {
	boolean: [...ALL_TEMPLATES.map((f) => f.cliId), 'tmp'],
	string: ['_'],
});

export const isTmpFlagSelected = () => parsed.tmp;

export const getPositionalArguments = () => parsed._;

export const getDirectoryArgument = (): string | null => {
	const positionalArgs = getPositionalArguments();
	return positionalArgs.length > 0 ? positionalArgs[0] || null : null;
};

export const selectTemplate = async () => {
	const isFlagSelected = ALL_TEMPLATES.find((f) => {
		return parsed[f.cliId];
	});

	if (isFlagSelected) {
		return isFlagSelected;
	}

	return (await selectAsync({
		message: 'Choose a template:',
		optionsPerPage: 20,

		choices: ALL_TEMPLATES.map((template) => {
			return {
				value: template,
				title: `${chalk.blue(template.shortName)}${
					template.cliId === 'editor-starter'
						? ' ' + chalk.yellow('(Paid)')
						: ''
				}${chalk.reset(
					` ${chalk.gray(template.description.trim())} ${chalk.gray(
						makeHyperlink({
							text: '(?)',
							url:
								template.cliId === 'editor-starter'
									? `${template.previewURL}`
									: `https://remotion.dev/templates/${template.cliId}`,
							fallback: '',
						}),
					)}`,
				)}`,
			};
		}),
	})) as Template;
};
