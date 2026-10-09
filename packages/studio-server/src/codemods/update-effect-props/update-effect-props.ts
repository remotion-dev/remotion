import {
	CodemodsInternals,
	updateEffectProps as updateEffectPropsInProject,
	type EffectArrayElement,
	type EffectPropUpdate,
	type PropDelta,
	type UpdateEffectPropsResult,
} from '@remotion/codemods';
import type {InteractivitySchema, SequenceNodePath} from 'remotion';

export type {
	EffectArrayElement,
	EffectPropUpdate,
	PropDelta,
	UpdateEffectPropsResult,
};

export const {enumerateEffectArrayElements} = CodemodsInternals;

export const updateEffectProps = async ({
	input,
	sequenceNodePath,
	effectIndex,
	update,
	schema,
}: {
	input: string;
	sequenceNodePath: SequenceNodePath;
	effectIndex: number;
	update: EffectPropUpdate;
	schema: InteractivitySchema;
}): Promise<UpdateEffectPropsResult> => {
	const result = await updateEffectPropsInProject({
		project: {files: {'source.tsx': input}, rootDir: '/'},
		effect: {filePath: 'source.tsx', nodePath: sequenceNodePath, effectIndex},
		updates: [update],
		schema,
	});
	return {
		...result.results[0],
		output: result.changes[0]?.nextContents ?? input,
	};
};
