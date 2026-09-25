import type {
	CanUpdateSequencePropsResponseTrue,
	JsxComponentIdentity,
	VideoConfigValues,
} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {type JsxNodeReference} from './node-references';
import {
	computeSequencePropsStatusFromContent,
	findJsxElementAtNodePath,
} from './sequence-props';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';
import {findEffectsAttr} from './sequence-props/can-update-effect-props';

export type GetJsxNodePropsOptions = {
	project: CodemodProject;
	node: JsxNodeReference;
	keys: string[];
	effectKeys?: string[][];
	assetKeys?: string[];
	componentIdentity?: JsxComponentIdentity | null;
	videoConfig?: VideoConfigValues;
};

export type JsxNodeProps = Pick<
	CanUpdateSequencePropsResponseTrue,
	'canUpdate' | 'props' | 'effects'
>;

export const getJsxNodeProps = ({
	project,
	node,
	keys,
	effectKeys,
	assetKeys,
	componentIdentity,
	videoConfig,
}: GetJsxNodePropsOptions): JsxNodeProps => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	let effects = effectKeys;
	if (effects === undefined) {
		const {ast} = getReadOnlySourceSnapshot(project.files[filePath]);
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
		componentIdentity: componentIdentity ?? null,
		assetKeys,
		keys,
		effects,
		videoConfigValues: videoConfig ?? null,
	});
	return result;
};
