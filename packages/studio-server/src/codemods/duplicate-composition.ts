import type {RecastCodemod} from '@remotion/studio-shared';
import {ensureNamedImport} from '../helpers/imports';
import {parseAst, serializeAst} from './parse-ast';
import type {Change} from './recast-mods';
import {applyCodemod} from './recast-mods';

const getPrettier = async () => {
	try {
		return await import('prettier');
	} catch {
		throw new Error('Prettier cannot be found in the current project.');
	}
};

export const formatOutput = async (tsContent: string) => {
	const prettier = await getPrettier();

	const {format, resolveConfig, resolveConfigFile} = prettier;

	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		throw new Error(
			'The Prettier config file was not found. For this feature, the "prettier" package must be installed and a .prettierrc file must exist.',
		);
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		throw new Error(
			`The Prettier config at ${configFilePath} could not be read`,
		);
	}

	const newContents = await format(tsContent, {
		...prettierConfig,
		filepath: 'test.tsx',
	});

	return newContents;
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
			'Unable to calculate the changes needed for this file. Edit the file manually.',
		);
	}

	if (codeMod.type === 'duplicate-composition' && codeMod.tag) {
		ensureNamedImport({
			ast: newAst,
			importedName: codeMod.tag,
			sourcePath: 'remotion',
			localName: codeMod.tag,
		});
	}

	if (codeMod.type === 'new-composition') {
		ensureNamedImport({
			ast: newAst,
			importedName: 'Composition',
			sourcePath: 'remotion',
			localName: 'Composition',
		});
		ensureNamedImport({
			ast: newAst,
			importedName: codeMod.componentName,
			sourcePath: codeMod.componentImportPath,
			localName: codeMod.componentName,
		});
	}

	if (codeMod.type === 'new-folder') {
		ensureNamedImport({
			ast: newAst,
			importedName: 'Folder',
			sourcePath: 'remotion',
			localName: 'Folder',
		});
	}

	const output = serializeAst(newAst);

	return {changesMade, newContents: output};
};
