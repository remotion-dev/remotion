import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {type JsxNodeReference} from './node-references';
import {findJsxElementAtNodePath} from './sequence-props';
import {findEffectsAttr} from './sequence-props/can-update-effect-props';
import {parseAst} from './sequence-props/parse-ast';

export type EffectReference = JsxNodeReference & {effectIndex: number};

export const getEffectSource = ({
	project,
	node,
}: {
	project: CodemodProject;
	node: JsxNodeReference;
}) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const jsx = findJsxElementAtNodePath(ast, node.nodePath);
	if (!jsx) {
		throw new Error('Could not find the JSX node');
	}

	const attr = findEffectsAttr(jsx.attributes);
	const lastSpread = jsx.attributes.findLastIndex(
		(attribute) => attribute.type === 'JSXSpreadAttribute',
	);
	if (
		lastSpread !== -1 &&
		(attr === null || jsx.attributes.indexOf(attr) < lastSpread)
	) {
		throw new Error(
			'Cannot edit effects that may be overridden by a JSX spread',
		);
	}

	const value = attr?.value;
	if (
		attr &&
		(value?.type !== 'JSXExpressionContainer' ||
			value.expression.type !== 'ArrayExpression')
	) {
		throw new Error('Effects must be an inline array');
	}

	const length =
		value?.type === 'JSXExpressionContainer' &&
		value.expression.type === 'ArrayExpression'
			? value.expression.elements.length
			: 0;
	return {filePath, input, length};
};

export const groupEffects = ({
	project,
	effects,
}: {
	project: CodemodProject;
	effects: EffectReference[];
}) => {
	if (effects.length === 0) {
		throw new Error('Expected at least one effect');
	}

	const groups = new Map<string, EffectReference[]>();
	for (const effect of effects) {
		const {filePath, length} = getEffectSource({project, node: effect});
		if (
			!Number.isInteger(effect.effectIndex) ||
			effect.effectIndex < 0 ||
			effect.effectIndex >= length
		) {
			throw new Error('Effect index is out of range');
		}

		const group = groups.get(filePath) ?? [];
		if (
			!group.some(
				(entry) =>
					entry.effectIndex === effect.effectIndex &&
					JSON.stringify(entry.nodePath) === JSON.stringify(effect.nodePath),
			)
		) {
			group.push({...effect, filePath});
		}

		groups.set(filePath, group);
	}

	return groups;
};
