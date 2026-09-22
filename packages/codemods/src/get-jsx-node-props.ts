import type {
	CanUpdateSequencePropsResponseTrue,
	VideoConfigValues,
} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {type JsxNodeReference} from './node-references';
import {
	computeSequencePropsStatusFromContent,
	findJsxElementAtNodePath,
} from './sequence-props';
import {findEffectsAttr} from './sequence-props/can-update-effect-props';
import {parseAst} from './sequence-props/parse-ast';

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
