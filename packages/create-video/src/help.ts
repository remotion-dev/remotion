import {FEATURED_TEMPLATES} from './templates';

const formatTemplateFlags = () => {
	return FEATURED_TEMPLATES.map((template) => `--${template.cliId}`).join(', ');
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
		'  --yes, -y       Enable non-interactive mode. Requires a template flag and a directory, unless --tmp is used.',
		'  --no-tailwind  Skip installing TailwindCSS when used with --yes.',
		'  --tmp          Create the project in a temporary directory.',
		'  --help, -h     Show this help.',
		'',
		'Template flags:',
		`  ${formatTemplateFlags()}`,
		'',
		'Full documentation: https://www.remotion.dev/docs/cli/create-video',
	].join('\n');
};
