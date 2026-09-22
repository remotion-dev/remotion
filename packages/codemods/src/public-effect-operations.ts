import type {InteractivitySchema} from 'remotion';
import type {CodemodValue} from './add-content';
import type {CodemodProject} from './codemod-project';
import {
	addEffect as addEffectInSource,
	deleteEffects as deleteEffectsInSource,
	duplicateEffects as duplicateEffectsInSource,
	reorderEffect as reorderEffectInSource,
	updateEffectProps as updateEffectPropsInSource,
} from './effect-operations';
import {findProjectFile} from './internals';
import {getJsxNodeProps} from './jsx-props';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';
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

const groupEffects = ({
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

export type AddEffectOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	importName: string;
	importPath: string;
	props?: Record<string, CodemodValue>;
};

export const addEffect = async <Project extends CodemodProject>({
	project,
	node,
	importName,
	importPath,
	props = {},
}: AddEffectOptions<Project>) => {
	const {filePath, input, length} = getEffectSource({project, node});
	const {output} = await addEffectInSource({
		input,
		sequenceNodePath: node.nodePath,
		effectName: importName,
		effectImportPath: importPath,
		effectConfig: props,
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		insertedEffect: {
			...getUpdatedNodeReference({...result, node}),
			effectIndex: length,
		},
	};
};

export type DeleteEffectsOptions<Project extends CodemodProject> = {
	project: Project;
	effects: EffectReference[];
};

export const deleteEffects = async <Project extends CodemodProject>({
	project,
	effects,
}: DeleteEffectsOptions<Project>) => {
	const groups = groupEffects({project, effects});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, group]) => {
			const input = project.files[filePath];
			const {output} = await deleteEffectsInSource({
				input,
				effects: group.map((effect) => ({
					type: 'single-effect',
					sequenceNodePath: effect.nodePath,
					effectIndex: effect.effectIndex,
				})),
			});
			return {
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			};
		}),
	);
	return getNodeEditResult({project, edits});
};

export type DuplicateEffectsOptions<Project extends CodemodProject> =
	DeleteEffectsOptions<Project>;

export const duplicateEffects = async <Project extends CodemodProject>({
	project,
	effects,
}: DuplicateEffectsOptions<Project>) => {
	const groups = groupEffects({project, effects});
	const edits = await Promise.all(
		[...groups].map(async ([filePath, group]) => {
			const input = project.files[filePath];
			const {output} = await duplicateEffectsInSource({
				input,
				effects: group.map((effect) => ({
					sequenceNodePath: effect.nodePath,
					effectIndex: effect.effectIndex,
				})),
			});
			return {
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			};
		}),
	);
	const result = getNodeEditResult({project, edits});
	return {
		...result,
		insertedEffects: [...groups.values()].flatMap((group) =>
			group.map((effect) => ({
				...getUpdatedNodeReference({...result, node: effect}),
				effectIndex:
					effect.effectIndex +
					1 +
					group.filter(
						(other) =>
							JSON.stringify(other.nodePath) ===
								JSON.stringify(effect.nodePath) &&
							other.effectIndex < effect.effectIndex,
					).length,
			})),
		),
	};
};

export type ReorderEffectOptions<Project extends CodemodProject> = {
	project: Project;
	effect: EffectReference;
	toIndex: number;
};

export const reorderEffect = async <Project extends CodemodProject>({
	project,
	effect,
	toIndex,
}: ReorderEffectOptions<Project>) => {
	const {filePath, input, length} = getEffectSource({project, node: effect});
	if (
		!Number.isInteger(toIndex) ||
		toIndex < 0 ||
		toIndex >= length ||
		!Number.isInteger(effect.effectIndex)
	) {
		throw new Error('Effect index is out of range');
	}

	const {output} = await reorderEffectInSource({
		input,
		sequenceNodePath: effect.nodePath,
		fromIndex: effect.effectIndex,
		toIndex,
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		updatedEffect: {
			...getUpdatedNodeReference({...result, node: effect}),
			effectIndex: toIndex,
		},
	};
};

export type UpdateEffectPropsOptions<Project extends CodemodProject> = {
	project: Project;
	effect: EffectReference;
	props: Record<string, CodemodValue>;
	schema?: InteractivitySchema;
};

export const updateEffectProps = async <Project extends CodemodProject>({
	project,
	effect,
	props,
	schema = {},
}: UpdateEffectPropsOptions<Project>) => {
	const {filePath, input, length} = getEffectSource({project, node: effect});
	if (
		!Number.isInteger(effect.effectIndex) ||
		effect.effectIndex < 0 ||
		effect.effectIndex >= length
	) {
		throw new Error('Effect index is out of range');
	}

	const keys = Object.keys(props);
	if (keys.length === 0) {
		throw new Error('Expected at least one effect prop');
	}

	const status = getJsxNodeProps({
		project,
		node: effect,
		keys: [],
		effectKeys: Array.from({length: effect.effectIndex + 1}, (_, index) =>
			index === effect.effectIndex ? keys : [],
		),
	}).effects[effect.effectIndex];
	if (!status?.canUpdate) {
		throw new Error(`Cannot update effect: ${status?.reason ?? 'not-found'}`);
	}

	let output = input;
	for (const [key, value] of Object.entries(props)) {
		if (!/^[A-Za-z_$][\w$]*$/.test(key)) {
			throw new Error('Effect prop names must be JavaScript identifiers');
		}

		if (status.props[key]?.status === 'computed') {
			throw new Error(`Cannot update computed effect prop "${key}"`);
		}

		output = (
			await updateEffectPropsInSource({
				input: output,
				sequenceNodePath: effect.nodePath,
				effectIndex: effect.effectIndex,
				update: {key, value, defaultValue: null},
				schema,
			})
		).output;
	}

	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		updatedEffect: {
			...getUpdatedNodeReference({...result, node: effect}),
			effectIndex: effect.effectIndex,
		},
	};
};
