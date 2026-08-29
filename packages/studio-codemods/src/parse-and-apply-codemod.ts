import type {RecastCodemod} from '@remotion/studio-shared';
import {duplicateCompositionInSource} from './duplicate-composition';
import type {Change} from './recast-mods';
import {applyCodemod} from './recast-mods';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst, serializeAst} from './sequence-props/parse-ast';

export const parseAndApplyCodemod = ({
	input,
	codeMod,
}: {
	input: string;
	codeMod: RecastCodemod;
}): {newContents: string; changesMade: Change[]} => {
	if (codeMod.type === 'duplicate-composition') {
		return duplicateCompositionInSource({input, codemod: codeMod});
	}

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

	if (codeMod.type === 'new-composition') {
		if (codeMod.canvasCapture === null) {
			ensureNamedImport({
				ast: newAst,
				importedName: 'Composition',
				sourcePath: 'remotion',
				localName: 'Composition',
			});
		}

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
