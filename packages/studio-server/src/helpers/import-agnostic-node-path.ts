import type {File, Statement} from '@babel/types';
import type {SequenceNodePath} from 'remotion';

const getActualProgramBodyIndex = ({
	body,
	importAgnosticIndex,
}: {
	body: Statement[];
	importAgnosticIndex: number;
}): number | null => {
	let seenNonImports = 0;
	for (let i = 0; i < body.length; i++) {
		if (body[i].type === 'ImportDeclaration') {
			continue;
		}

		if (seenNonImports === importAgnosticIndex) {
			return i;
		}

		seenNonImports++;
	}

	return null;
};

const getImportAgnosticProgramBodyIndex = ({
	body,
	actualIndex,
}: {
	body: Statement[];
	actualIndex: number;
}): number | null => {
	if (actualIndex < 0 || actualIndex >= body.length) {
		return null;
	}

	let seenNonImports = 0;
	for (let i = 0; i <= actualIndex; i++) {
		if (body[i].type === 'ImportDeclaration') {
			continue;
		}

		if (i === actualIndex) {
			return seenNonImports;
		}

		seenNonImports++;
	}

	return null;
};

const hasProgramBodyIndex = (
	nodePath: SequenceNodePath,
): nodePath is ['program', 'body', number, ...Array<string | number>] => {
	return (
		nodePath[0] === 'program' &&
		nodePath[1] === 'body' &&
		typeof nodePath[2] === 'number'
	);
};

export const toImportAgnosticNodePath = ({
	ast,
	nodePath,
}: {
	ast: File;
	nodePath: SequenceNodePath;
}): SequenceNodePath => {
	if (!hasProgramBodyIndex(nodePath)) {
		return nodePath;
	}

	const importAgnosticIndex = getImportAgnosticProgramBodyIndex({
		body: ast.program.body,
		actualIndex: nodePath[2],
	});
	if (importAgnosticIndex === null) {
		return nodePath;
	}

	return ['program', 'body', importAgnosticIndex, ...nodePath.slice(3)];
};

export const fromImportAgnosticNodePath = ({
	ast,
	nodePath,
}: {
	ast: File;
	nodePath: SequenceNodePath;
}): SequenceNodePath | null => {
	if (!hasProgramBodyIndex(nodePath)) {
		return nodePath;
	}

	const actualIndex = getActualProgramBodyIndex({
		body: ast.program.body,
		importAgnosticIndex: nodePath[2],
	});
	if (actualIndex === null) {
		return null;
	}

	return ['program', 'body', actualIndex, ...nodePath.slice(3)];
};
