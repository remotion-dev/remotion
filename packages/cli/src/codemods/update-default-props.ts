import type {EnumPath} from '../editor/components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {stringifyDefaultProps} from './stringify-with-path';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type PrettierType = typeof import('prettier');

const findStarter = ({
	input,
	compositionId,
}: {
	input: string;
	compositionId: string;
}) => {
	const format1 = input.indexOf(`id="${compositionId}"`);
	if (format1 > -1) {
		return format1;
	}

	const format2 = input.indexOf(`id='${compositionId}'`);
	if (format2 > -1) {
		return format2;
	}

	const format3 = input.indexOf(`id={'${compositionId}'}`);
	if (format3 > -1) {
		return format3;
	}

	const format4 = input.indexOf(`id={"${compositionId}"}`);
	if (format4 > -1) {
		return format4;
	}

	const format5 = input.indexOf(`id={\`${compositionId}\``);
	if (format5 > -1) {
		return format5;
	}

	throw new Error(`Could not find composition ID ${compositionId} in file`);
};

const findEndPosition = (input: string, currentPosition: number) => {
	const asConstVersion = input
		.slice(currentPosition + 1)
		.search(/as\sconst[ \t\n\r]+\}/);
	if (asConstVersion !== -1) {
		const nextEnd = input.indexOf('}', asConstVersion + currentPosition + 1);
		return nextEnd - 1;
	}

	const next = input.indexOf('}}', currentPosition + 1);
	if (next !== -1) {
		return next;
	}

	throw new Error('Could not find end of defaultProps');
};

const findEnder = (
	input: string,
	position: number,
	maxPosition: number,
	compositionId: string
) => {
	let currentPosition = position;
	while (currentPosition < maxPosition) {
		const next = findEndPosition(input, currentPosition);

		currentPosition = next;

		const nextChar = input[next + 1];
		if (nextChar === ',') {
			continue;
		}

		return [position, currentPosition + 1];
	}

	throw new Error(
		`No \`defaultProps\` prop found in the <Composition/> tag with the ID "${compositionId}".`
	);
};

const findTerminators = (input: string, position: number) => {
	const nextComposition = input.indexOf('<Composition', position);
	if (nextComposition > -1) {
		return nextComposition;
	}

	const nextStill = input.indexOf('<Still', position);
	if (nextStill > -1) {
		return nextStill;
	}

	return Infinity;
};

export const updateDefaultProps = async ({
	input,
	compositionId,
	newDefaultProps,
	enumPaths,
}: {
	input: string;
	compositionId: string;
	newDefaultProps: Record<string, unknown>;
	enumPaths: EnumPath[];
}): Promise<string> => {
	const starter = findStarter({input, compositionId});

	const START_TOKEN = 'defaultProps={';

	const start = input.indexOf(START_TOKEN, starter);
	if (start === -1) {
		throw new Error(
			`No \`defaultProps\` prop found in the <Composition/> tag with the ID "${compositionId}".`
		);
	}

	const maxEnd = findTerminators(input, starter);
	const [startPos, endPos] = findEnder(
		input,
		start + START_TOKEN.length,
		maxEnd,
		compositionId
	);

	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch (err) {
		throw new Error('Prettier cannot be found in the current project.');
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	const newFile =
		input.substring(0, startPos) +
		stringifyDefaultProps({props: newDefaultProps, enumPaths}) +
		input.substring(endPos);

	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		throw new Error('The Prettier config file was not found');
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		throw new Error(
			`The Prettier config at ${configFilePath} could not be read`
		);
	}

	const prettified = format(newFile, {
		...prettierConfig,
		rangeStart: startPos,
		rangeEnd: endPos,
		filepath: 'test.tsx',
		plugins: [],
		endOfLine: 'auto',
	});
	return prettified;
};
