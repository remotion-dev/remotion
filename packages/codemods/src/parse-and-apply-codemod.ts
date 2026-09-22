import type {RecastCodemod} from '@remotion/studio-shared';
import {applyVisualControl} from './apply-visual-control';
import {editCompositionInSource} from './composition-source-edits';
import {duplicateCompositionInSource} from './duplicate-composition-in-source';
import {editFolderInSource} from './folder-source-edits';
import type {Change} from './recast-mods';
import {applyCodemod} from './recast-mods';
import {parseAst, serializeAst} from './sequence-props/parse-ast';

export const parseAndApplyCodemod = ({
	input,
	codeMod,
}: {
	input: string;
	codeMod: RecastCodemod;
}): {newContents: string; changesMade: Change[]} => {
	if (codeMod.type === 'apply-visual-control') {
		const result = applyVisualControl({input, transformation: codeMod});
		if (result.changesMade.length === 0) {
			throw new Error(
				'Unable to calculate the changes needed for this file. Edit the file manually.',
			);
		}

		return result;
	}

	if (codeMod.type === 'duplicate-composition') {
		return duplicateCompositionInSource({input, codemod: codeMod});
	}

	if (
		codeMod.type === 'new-composition' ||
		codeMod.type === 'rename-composition' ||
		codeMod.type === 'delete-composition' ||
		codeMod.type === 'update-composition-metadata'
	) {
		return editCompositionInSource({input, codeMod});
	}

	if (
		codeMod.type === 'move-composition-to-folder' ||
		codeMod.type === 'move-composition-or-folder' ||
		codeMod.type === 'rename-folder' ||
		codeMod.type === 'new-folder' ||
		codeMod.type === 'delete-folder'
	) {
		return editFolderInSource({input, codeMod});
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

	const output = serializeAst(newAst);

	return {changesMade, newContents: output};
};
