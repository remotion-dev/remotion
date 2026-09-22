import type {InteractivitySchema} from 'remotion';
import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {updateEffectProps as updateEffectPropsInSource} from './effect-operations';
import {type EffectReference, getEffectSource} from './effect-references';
import {getJsxNodeProps} from './get-jsx-node-props';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';

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
