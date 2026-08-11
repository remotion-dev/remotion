import {FEATURED_TEMPLATES} from './templates';

const formatOption = ({
	flag,
	description,
}: {
	flag: string;
	description: string;
}) => {
	return `  ${flag.padEnd(18)}${description}`;
};

const formatTemplateFlags = () => {
	return FEATURED_TEMPLATES.map((template) => `  --${template.cliId}`).join(
		'\n',
	);
};

export const getCreateVideoHelp = () => {
	return [
		'create-video',
		'',
		'Scaffold a new Remotion project.',
		'',
		'Usage:',
		'  npx create-video --yes --blank my-video',
		'  npx create-video [options] [directory]',
		'',
		'Arguments:',
		'  directory       Directory in which the project should be created.',
		'',
		'Options:',
		formatOption({
			flag: '--yes, -y',
			description:
				'Enable non-interactive mode. Requires a template flag and a directory, unless --tmp is used.',
		}),
		formatOption({
			flag: '--no-tailwind',
			description: 'Skip installing TailwindCSS when used with --yes.',
		}),
		formatOption({
			flag: '--tmp',
			description: 'Create the project in a temporary directory.',
		}),
		formatOption({
			flag: '--help, -h',
			description: 'Show this help.',
		}),
		'',
		'Template flags:',
		formatTemplateFlags(),
		'',
		'Full documentation: https://www.remotion.dev/docs/cli/create-video',
	].join('\n');
};
