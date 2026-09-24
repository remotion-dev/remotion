import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {type AddContentOptions, insertContent} from './insert-content';
import {type CodemodInsertionResult} from './node-references';

export type AddComponentOptions<Project extends CodemodProject> =
	AddContentOptions<Project> & {
		importName: string;
		importPath: string;
		props?: Record<string, CodemodValue>;
	};

export const addComponent = <Project extends CodemodProject>({
	importName,
	importPath,
	props = {},
	...options
}: AddComponentOptions<Project>): Promise<CodemodInsertionResult> => {
	if (!/^[A-Z_$][\w$]*$/.test(importName) || importName === 'default') {
		throw new Error(
			'importName must be a named component export beginning with an uppercase letter, _ or $',
		);
	}

	return insertContent({
		...options,
		element: {
			type: 'component',
			componentName: importName,
			importName,
			importPath,
			props: Object.entries(props).map(([name, value]) => ({name, value})),
			position: null,
		},
	});
};
