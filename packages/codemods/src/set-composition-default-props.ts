import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {
	type CompositionTarget,
	requireComposition,
} from './composition-editing';
import {updateJsxNodeProps} from './update-jsx-node-props';

export type SetCompositionDefaultPropsOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		defaultProps: Record<string, CodemodValue>;
	};

export const setCompositionDefaultProps = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	defaultProps,
}: SetCompositionDefaultPropsOptions<Project>) => {
	const node = requireComposition({project, compositionFile, compositionId});
	return updateJsxNodeProps({project, node, props: {defaultProps}});
};
