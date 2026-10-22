import type {CodemodResult} from '../index';

export const getChangedContents = (result: CodemodResult, filePath: string) => {
	const contents = result.changes.find(
		(change) => change.filePath === filePath,
	)?.nextContents;
	if (contents === null || contents === undefined) {
		throw new Error(`Expected a changed file: ${filePath}`);
	}

	return contents;
};
