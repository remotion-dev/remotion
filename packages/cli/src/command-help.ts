import {chalk} from './chalk';

export type CommandHelpOption = {
	flag: string;
	description: string;
};

export type CommandHelpEntry = {
	path: readonly string[];
	args: string;
	description: string;
	documentation: string;
	options: readonly CommandHelpOption[];
	listed?: boolean;
};

type RemotionOptionForHelp = {
	cliFlag: string;
	name: string;
	type: unknown;
};

export const makeCommandHelpOption = ({
	option,
	description,
	value,
}: {
	option: RemotionOptionForHelp;
	description?: string;
	value?: string | null;
}): CommandHelpOption => {
	const valueSuffix =
		value === null
			? ''
			: ` ${value ?? (typeof option.type === 'boolean' ? '' : '<value>')}`;

	return {
		flag: `--${option.cliFlag}${valueSuffix}`.trimEnd(),
		description: description ?? option.name,
	};
};

const commandMatches = (
	command: CommandHelpEntry,
	selectedPath: readonly string[],
) =>
	command.path.every((part, index) => selectedPath[index] === part) &&
	selectedPath.length >= command.path.length;

const formatOption = (option: CommandHelpOption, width: number) => {
	return `  ${chalk.blue(option.flag.padEnd(width))}${option.description}`;
};

export const getCommandHelp = ({
	binaryName,
	commands,
	selectedPath,
	rootDocumentation,
}: {
	binaryName: string;
	commands: readonly CommandHelpEntry[];
	selectedPath: readonly string[];
	rootDocumentation: string;
}): string[] => {
	const selectedCommand = commands
		.filter((command) => commandMatches(command, selectedPath))
		.sort((a, b) => b.path.length - a.path.length)[0];

	if (selectedCommand) {
		const displayPath = selectedPath
			.slice(0, selectedCommand.path.length)
			.join(' ');
		const selectedBinaryName = displayPath
			? `${binaryName} ${displayPath}`
			: binaryName;
		const children = commands.filter(
			(command) =>
				command.listed !== false &&
				command.path.length === selectedCommand.path.length + 1 &&
				selectedCommand.path.every(
					(part, index) => command.path[index] === part,
				),
		);
		const options = [
			...selectedCommand.options,
			{flag: '--help', description: 'Show this help.'},
		];
		const optionWidth =
			Math.max(...options.map((option) => option.flag.length)) + 2;
		const commandLines = [
			'',
			chalk.blue(selectedBinaryName) + chalk.gray(selectedCommand.args),
			selectedCommand.description,
		];

		if (children.length > 0) {
			commandLines.push('', 'Commands:');
			for (const child of children) {
				commandLines.push(
					'',
					chalk.blue(`${binaryName} ${child.path.join(' ')}`) +
						chalk.gray(child.args),
					child.description,
				);
			}
		}

		commandLines.push(
			'',
			'Options:',
			...options.map((option) => formatOption(option, optionWidth)),
			'',
			chalk.gray(`Full documentation: ${selectedCommand.documentation}`),
		);
		return commandLines;
	}

	const lines = ['', 'Available commands:'];
	for (const command of commands) {
		if (command.path.length !== 1 || command.listed === false) {
			continue;
		}

		lines.push(
			'',
			chalk.blue(`${binaryName} ${command.path[0]}`) + chalk.gray(command.args),
			command.description,
			chalk.gray(command.documentation),
		);
	}

	lines.push('', `Visit ${rootDocumentation} for browsable CLI documentation.`);
	return lines;
};
