import type {
	CanUpdateSequencePropsResponseTrue,
	InteractivitySchema,
	VideoConfigValues,
} from 'remotion';
import type {CodemodValue} from './add-content';
import type {CodemodProject} from './codemod-project';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';
import {
	computeSequencePropsStatusFromContent,
	findJsxElementAtNodePath,
} from './sequence-props';
import {findEffectsAttr} from './sequence-props/can-update-effect-props';
import {parseAst} from './sequence-props/parse-ast';
import {updateMultipleSequenceProps} from './update-sequence-props';

export type GetJsxNodePropsOptions = {
	project: CodemodProject;
	node: JsxNodeReference;
	keys: string[];
	effectKeys?: string[][];
	videoConfig?: VideoConfigValues;
};

export type JsxNodeProps = Pick<
	CanUpdateSequencePropsResponseTrue,
	'props' | 'effects'
>;

export const getJsxNodeProps = ({
	project,
	node,
	keys,
	effectKeys,
	videoConfig,
}: GetJsxNodePropsOptions): JsxNodeProps => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	let effects = effectKeys;
	if (effects === undefined) {
		const ast = parseAst(project.files[filePath]);
		const jsx = findJsxElementAtNodePath(ast, node.nodePath);
		const attr = jsx ? findEffectsAttr(jsx.attributes) : null;
		const array =
			attr?.value?.type === 'JSXExpressionContainer' &&
			attr.value.expression.type === 'ArrayExpression'
				? attr.value.expression
				: null;
		effects = array
			? array.elements.map((element) => {
					const config =
						element?.type === 'CallExpression' ? element.arguments[0] : null;
					return config?.type === 'ObjectExpression'
						? config.properties.flatMap((property) => {
								if (property.type !== 'ObjectProperty' || property.computed)
									return [];
								return property.key.type === 'Identifier'
									? [property.key.name]
									: property.key.type === 'StringLiteral'
										? [property.key.value]
										: [];
							})
						: [];
				})
			: [];
	}

	const result = computeSequencePropsStatusFromContent({
		fileContents: project.files[filePath],
		nodePath: node.nodePath,
		componentIdentity: null,
		keys,
		effects,
		videoConfigValues: videoConfig ?? null,
	});
	return {props: result.props, effects: result.effects};
};

export type UpdateJsxNodePropsOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	props: Record<string, CodemodValue | undefined>;
	schema?: InteractivitySchema;
	videoConfig?: VideoConfigValues;
};

export const updateJsxNodeProps = <Project extends CodemodProject>({
	project,
	node,
	props,
	schema = {},
	videoConfig,
}: UpdateJsxNodePropsOptions<Project>) => {
	const keys = Object.keys(props);
	if (keys.length === 0) {
		throw new Error('Expected at least one prop to update');
	}

	const status = getJsxNodeProps({project, node, keys, videoConfig});
	for (const key of keys) {
		if (
			!key ||
			key.split('.').some((part) => !part) ||
			key.split('.').length > 2
		) {
			throw new Error(
				'Prop keys must be names or one-level nested paths such as style.opacity',
			);
		}

		if (status.props[key]?.status === 'computed') {
			throw new Error(`Cannot update computed prop "${key}"`);
		}
	}

	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const edit = updateMultipleSequenceProps({
		input,
		ast,
		changes: [
			{
				nodePath: node.nodePath,
				updates: Object.entries(props).map(([key, value]) => ({
					key,
					value,
					defaultValue: null,
				})),
				schema,
				videoConfigValues: videoConfig ?? null,
			},
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({
		ast: edit.ast,
		captured,
		output: edit.output,
	});
	const result = getNodeEditResult({
		project,
		edits: [{filePath, output: edit.output, nodePathRemappings}],
	});
	return {...result, updatedNode: getUpdatedNodeReference({...result, node})};
};
