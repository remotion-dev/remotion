import type {File} from '@babel/types';
import type {RecastCodemod} from '@remotion/studio-shared';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';
import {applyCodemod} from './recast-mods';

const getPrettier = async () => {
	try {
		return await import('prettier');
	} catch (err) {
		throw new Error('Prettier cannot be found in the current project.');
	}
};

export const parseAndApplyCodemod = async ({
	input,
	codeMod,
}: {
	input: string;
	codeMod: RecastCodemod;
}): Promise<string> => {
	const ast = recast.parse(input, {
		parser: tsParser,
	}) as File;

	const newAst = applyCodemod({
		file: ast,
		codeMod,
	});

	const output = recast.print(newAst, {
		parser: tsParser,
	}).code;

	const prettier = await getPrettier();

	const {format, resolveConfig, resolveConfigFile} = prettier;

	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		throw new Error('The Prettier config file was not found');
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		throw new Error(
			`The Prettier config at ${configFilePath} could not be read`,
		);
	}

	const prettified = await format(output, {
		...prettierConfig,
		filepath: 'test.tsx',
	});
	return prettified;
};
