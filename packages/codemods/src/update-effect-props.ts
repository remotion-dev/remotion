import type {InteractivitySchema} from 'remotion';
import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {
	updateEffectProps as updateEffectPropsInSource,
	type EffectPropUpdate,
	type UpdateEffectPropsResult,
} from './effect-operations';
import {type EffectReference, getEffectSource} from './effect-references';
import {getNodeProps} from './get-node-props';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';

export type UpdateEffectPropsOptions<Project extends CodemodProject> = {
	project: Project;
	effect: EffectReference;
	schema?: InteractivitySchema;
} & (
	| {props: Record<string, CodemodValue>; updates?: never}
	| {updates: EffectPropUpdate[]; props?: never}
);

export const updateEffectProps = async <Project extends CodemodProject>({
	project,
	effect,
	props,
	updates,
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

	const propUpdates =
		updates ??
		Object.entries(props).map(([key, value]) => ({
			key,
			value,
			defaultValue: null,
		}));
	const keys = propUpdates.map(({key}) => key);
	if (keys.length === 0) {
		throw new Error('Expected at least one effect prop');
	}

	const status = getNodeProps({
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
	const results: UpdateEffectPropsResult[] = [];
	for (const update of propUpdates) {
		const {key} = update;
		if (!/^[A-Za-z_$][\w$]*$/.test(key)) {
			throw new Error('Effect prop names must be JavaScript identifiers');
		}

		if (!updates && status.props[key]?.status === 'computed') {
			throw new Error(`Cannot update computed effect prop "${key}"`);
		}

		const edit = await updateEffectPropsInSource({
			input: output,
			sequenceNodePath: effect.nodePath,
			effectIndex: effect.effectIndex,
			update,
			schema,
		});
		output = edit.output;
		results.push(edit);
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
		results,
		updatedEffect: {
			...getUpdatedNodeReference({project, ...result, node: effect}),
			effectIndex: effect.effectIndex,
		},
	};
};
