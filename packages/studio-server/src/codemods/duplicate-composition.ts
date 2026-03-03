import type {RecastCodemod} from '@remotion/studio-shared';
import {parseAst, serializeAst} from './parse-ast';
import type {Change} from './recast-mods';
import {applyCodemod} from './recast-mods';

export const formatOutput = async (
	tsContent: string,
): Promise<{output: string; formatted: boolean}> => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	type PrettierType = typeof import('prettier');
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch {
		return {output: tsContent, formatted: false};
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		return {output: tsContent, formatted: false};
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		return {output: tsContent, formatted: false};
	}

	const newContents = await format(tsContent, {
		...prettierConfig,
		filepath: 'test.tsx',
	});

	return {output: newContents, formatted: true};
};

export const parseAndApplyCodemod = ({
	input,
	codeMod,
}: {
	input: string;
	codeMod: RecastCodemod;
}): {newContents: string; changesMade: Change[]} => {
	const ast = parseAst(input);

	const {newAst, changesMade} = applyCodemod({
		file: ast,
		codeMod,
	});

	if (changesMade.length === 0) {
		throw new Error(
			'Unable to calculate the changes needed for this file. Edit the root file manually.',
		);
	}

	const output = serializeAst(newAst);

	return {changesMade, newContents: output};
};
